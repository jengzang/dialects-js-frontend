// 整理數據,用於地圖繪製
import { queryStore, mapStore, resultCache, userStore } from './store.js'
import { api } from './auth.js'

export async function func_mergeData(resultData = null, mapData = null) {
    // 1) 数据来源：优先参数，否则 fallback 到 window
    const latestResults = resultData ?? window.latestResults;
    const locations_data = mapData ?? window.locations_data;

    // 2) 检查数据是否准备好
    if (!latestResults || !locations_data) {
        console.log("数据未准备好！");
        return []; // ✅ 有返回值：空数组
    }

    // 3) 读取地图基础信息
    const zoomLevel = locations_data.zoom_level;
    const centerCoordinate = locations_data.center_coordinate;
    const coordinates_raw = locations_data.coordinates_locations || [];

    // 最小化改动 - 创建地点到坐标的映射
    const locationToCoordinates = {};
    coordinates_raw.forEach(coord => {
        locationToCoordinates[coord[0]] = coord[1]; // coord[0] 是地点，coord[1] 是坐标
    });

    // 用于存储合并后的数据
    const mergedData = [];
    // 用一个对象根据 location 和 feature 分组数据
    const groupedData = {};

    // 遍历 latestResults 中的数据，获取相关列数据
    latestResults.forEach(item => {
        // 确保 "分組值" 是一个对象，并从中正确获取 feature 和 value
        if (item["分組值"] && typeof item["分組值"] === "object") {
            const keys = Object.keys(item["分組值"]);
            if (keys.length > 0) {
                const feature = keys[0];
                const value = item["分組值"][feature];
                const percentage = item["佔比"];
                const location = item["地點"];
                const cha_nums = item["字數"];

                if (!groupedData[location]) groupedData[location] = {};
                if (!groupedData[location][feature]) {
                    groupedData[location][feature] = { items: [], detailContent: [] };
                }

                // 判断字数 * 占比是否大于等于 0.06
                if (percentage * cha_nums >= 0.06) {
                    groupedData[location][feature].detailContent.push({ value, percentage });
                }

                groupedData[location][feature].items.push({ value, percentage, cha_nums });
            }
        }
    });

    // 遍历所有分组的数据，进行合并
    for (const location in groupedData) {
        for (const feature in groupedData[location]) {
            const group = groupedData[location][feature].items;
            const more = [];
            const middle = [];
            const less = [];

            // 按占比分类
            group.forEach(item => {
                if (item.percentage >= 0.5) more.push(item.value);
                else if (item.percentage >= 0.35) middle.push(item.value);
                else if (item.percentage >= 0.2) less.push(item.value);
            });

            // 合并后处理的值
            let finalValue = "";

            // 处理 "多"
            if (more.length > 0) {
                finalValue += (more.length === 1) ? more.join("") : more.join("/");
            }

            // 处理 "中"
            if (middle.length > 0) {
                if (less.length === 0 && more.length === 0) {
                    finalValue += (middle.length === 1) ? middle[0] : middle.join("/");
                } else {
                    finalValue += `(${middle.join(",")})`;
                }
            }

            // 处理 "少"
            if (less.length > 0) {
                finalValue += `(*${less.join(", *")})`;
            }

            if (!finalValue) finalValue = "散";

            // 获取最大占比对应的 value
            // ⚠️ 最小化改动：如果 detailContent 为空，避免 reduce 报错
            const dc = groupedData[location][feature].detailContent;
            const maxPercentageValue =
                (Array.isArray(dc) && dc.length > 0)
                    ? dc.reduce((prev, current) => (prev.percentage > current.percentage ? prev : current)).value
                    : "";

            // 最小化改动 - 获取对应地点的坐标并添加到 mergedData 中
            const coordinate = locationToCoordinates[location] || null;

            mergedData.push({
                location,
                feature,
                value: finalValue,
                zoomLevel,
                coordinate,
                centerCoordinate,
                maxValue: maxPercentageValue,
                detailContent: dc // 详细记录
            });
        }
    }

    const locations = queryStore.locations;
    const regions = queryStore.regions;
    const uniqueFeatures = [...new Set(latestResults.map(result => result.特徵值))];

    // 创建请求参数
    const queryParams = {
        locations: locations,
        regions: regions,
        need_features: uniqueFeatures
    };

    let shouldContinue = true;
    let result = null;
    try {
        // 如果用户未登录，直接返回，不查询个人数据
        if (!userStore.isAuthenticated || userStore.role === 'anonymous') {
            shouldContinue = false;
            console.log('用戶未登錄，不查詢個人數據');
            throw new Error('用戶未登錄');
        }

        // 用 URLSearchParams 拼接到 GET URL
        const queryString = new URLSearchParams(queryParams).toString();

        // 使用统一的 api 函数
        result = await api(`/api/get_custom?${queryString}`, {
            method: 'GET',
            showError: false  // 不自动显示错误，由下方逻辑处理
        });

    } catch (error) {
        shouldContinue = false;
        console.log('查詢個人數據失敗:', error.message || error);
    }
    if (shouldContinue && Array.isArray(result)) {
        mergeBackendData(result, mergedData,
            mergedData.length > 0 ? mergedData[0].zoomLevel : 10,
            mergedData.length > 0 ? mergedData[0].centerCoordinate : [0, 0]
        );
    } else {
        console.log("當前地點/分區選擇不包含自定義數據", result);
    }

    assignColorToMergedData(mergedData);
    mapStore.mergedData = mergedData;
    return mergedData;
}


// 對用戶自定義數據進行處理
function mergeBackendData(result, mergedData, defaultZoom, defaultCenter) {
    result.forEach(row => {
        const featureType = row["聲韻調"];  // "声母"/"韵母"/"声调"

        // ✅ 前端过滤：只有当后端返回的聲韻調在 resultCache.features 中时才显示
        if (!resultCache.features || !resultCache.features.includes(featureType)) {
            return; // 跳过这条数据
        }

        const newCoordinate = row["經緯度"];
        const newLocation = row["簡稱"];
        const newFeature = row["特徵"];  // 如 "舌尖"
        const created_at = row["created_at"] || null;

        const locationIndex = mergedData.findIndex(item =>
            item.feature === newFeature &&
            JSON.stringify(item.coordinate) === JSON.stringify(newCoordinate)
        );

        if (locationIndex === -1) {
            mergedData.push({
                location: newLocation,
                feature: newFeature,
                value: row["值"],
                coordinate: newCoordinate,
                maxValue: row["maxValue"],
                notes: row["說明"],
                iscustoms: 1,
                zoomLevel: defaultZoom,
                centerCoordinate: defaultCenter,
                detailContent: [],
                created_at:created_at,
            });
        } else {
            const existingItem = mergedData[locationIndex];
            if (existingItem.location === newLocation) {
                existingItem.value += "║" + row["值"];
                existingItem.maxValue += "║" + row["maxValue"];
                existingItem.notes += "║" + row["說明"];
                existingItem.iscustoms = 1;
            } else {
                mergedData.push({
                    location: newLocation,
                    feature: newFeature,
                    value: row["值"],
                    coordinate: newCoordinate,
                    maxValue: row["maxValue"],
                    notes: row["說明"],
                    iscustoms: 1,
                    zoomLevel: defaultZoom,
                    centerCoordinate: defaultCenter,
                    detailContent: [],
                    created_at:created_at,
                });
            }
        }
    });
}

// 分配顏色
function assignColorToMergedData(mergedData) {
    const colorScale = [
        '#FFB3B3', '#FFB366', '#FFFF99', '#B3FFB3', '#99CCFF', '#D4A6FF',
        '#FF6666', '#FFD699', '#99CCCC', '#D1D1FF', '#FF9999', '#FFB3FF',
        '#FFFF66', '#B3FF99', '#99CCFF', '#FFCC99', '#CCCCFF', '#FF66CC',
        '#FFFF66', '#B3FFCC'
    ];
    let featureMaxValuesToColor = {};

    mergedData.forEach(item => {
        const { feature, maxValue } = item;
        if (!featureMaxValuesToColor[feature]) {
            featureMaxValuesToColor[feature] = new Set();
        }
        featureMaxValuesToColor[feature].add(maxValue);
    });

    let featureToColor = {};
    Object.keys(featureMaxValuesToColor).forEach(feature => {
        const values = Array.from(featureMaxValuesToColor[feature]);
        featureToColor[feature] = {};
        values.forEach((val, idx) => {
            featureToColor[feature][val] = colorScale[idx % colorScale.length];
        });
    });

    mergedData.forEach(item => {
        item.color = featureToColor[item.feature]?.[item.maxValue] || '#888';
    });
}

export function generateCharsMergedData(resultData, locationsData) {
    const locationToCoordinates = {};
    locationsData.coordinates_locations.forEach(([loc, coord]) => {
        locationToCoordinates[loc] = coord;
    });

    const mergedData = resultData.map(item => {
        const syllablesString = item.音节.join('·');

        const notesArray = item.notes.filter(note => note !== "_"); // 忽略 "_" 的备注
        // 创建音节和备注的一一对应数组，只有当备注不为空时才保留
        const pairedArray = item.音节
            .map((syllable, index) => {
                if (notesArray[index]) {
                    return `${syllable}:${notesArray[index]}`;  // 如果备注存在，返回"音节:备注"
                }
                return null;  // 如果备注为空，返回 null 来忽略
            })
            .filter(item => item !== null);  // 过滤掉 null 项

        return {
            location: item.location,
            feature: item.char,
            value: syllablesString,
            zoomLevel: locationsData.zoom_level,
            coordinate: locationToCoordinates[item.location] || [0, 0],
            centerCoordinate: locationsData.center_coordinate,
            maxValue: syllablesString,
            detailContent: pairedArray
        };
    });

    assignColorToMergedData(mergedData);
    mapStore.mergedData = mergedData;
    return mergedData;
}


// 新的函数：处理音调并分配颜色
export function generateTonesMergedData(resultData, locationsData) {
    // 1) tone 映射
    const toneMapping = {
        T1: "陰平",
        T2: "陽平",
        T3: "陰上",
        T4: "陽上",
        T5: "陰去",
        T6: "陽去",
        T7: "陰入",
        T8: "陽入",
        T9: "其他調",
        T10: "輕聲"
    };

    // 2) 地点 -> 坐标映射
    const locationToCoordinates = {};
    (locationsData?.coordinates_locations || []).forEach(([loc, coord]) => {
        locationToCoordinates[loc] = coord;
    });

    // 3) 将原始 tones_result 扁平化并同时组装 mergedData
    const mergedData = [];

    (resultData || []).forEach(locationData => {
        const tones = locationData?.tones || [];
        const locationName = locationData?.["簡稱"] ?? locationData?.location ?? "";

        tones.forEach(toneData => {
            const toneName = Object.keys(toneData || {})[0];  // e.g. "T1"
            if (!toneName) return;

            let toneValue = toneData[toneName];              // e.g. "55", "無", "`33", "T2"
            let notes = [];

            // 3.1 处理 toneValue：去掉 `（如果不是 無）
            if (toneValue === "無") {
                // 保持 "無"（你原代码其实没转空，而是保持“無”）
                toneValue = "無";
            } else if (typeof toneValue === "string") {
                toneValue = toneValue.replace(/`/g, "");
            }

            // 3.2 toneName -> 中文调名
            const chineseToneName = toneMapping[toneName] || toneName;

            // 3.3 若 toneValue 是 "T*"，表示与某调合并：备注 + 用对应调的实际数值替换
            if (typeof toneValue === "string" && toneValue.startsWith("T")) {
                const chineseMergedTo = toneMapping[toneValue] || toneValue;
                console.log(chineseMergedTo)
                notes.push(`與${chineseMergedTo}合併`);  // 改为推入数组

                // 在当前地点的 tones 里找到 toneValue 对应那一项，取其值作为真正数值
                const toneObj = tones.find(obj => obj && Object.prototype.hasOwnProperty.call(obj, toneValue));
                if (toneObj) {
                    let v = toneObj[toneValue];
                    if (v === "無") v = "無";
                    else if (typeof v === "string") v = v.replace(/`/g, "");
                    toneValue = v ?? "";
                } else {
                    toneValue = "";
                }
            }

            // 3.4 坐标/视图信息
            const coordinate = locationToCoordinates[locationName] || [0, 0];

            mergedData.push({
                location: locationName,
                feature: chineseToneName,                 // 中文调名作为 feature
                value: toneValue,
                zoomLevel: locationsData?.zoom_level,
                coordinate,
                centerCoordinate: locationsData?.center_coordinate,
                maxValue: toneValue,
                detailContent: notes                      // 合并说明
            });
        });
    });

    // 4) 一次性分配颜色
    assignColorToMergedData(mergedData);

    // 5) 写入 mapStore 并返回
    mapStore.mergedData = mergedData;
    return mergedData;
}

