// 整理數據，用於地圖繪製
async function func_mergeData() {
    // 检查数据是否准备好
    if (!window.latestResults || !window.locations_data) {
        console.log("数据未准备好！");
        return;
    }
    let locations_data = window.locations_data;
    let latestResults = window.latestResults;
    // 获取 zoom_level 和 center_coordinate
    let zoomLevel = locations_data.zoom_level;
    let centerCoordinate = locations_data.center_coordinate;
    let coordinates_raw = locations_data.coordinates_locations;

    // 最小化改动 - 创建地点到坐标的映射
    let locationToCoordinates = {};
    coordinates_raw.forEach(coord => {
        locationToCoordinates[coord[0]] = coord[1]; // coord[0] 是地点，coord[1] 是坐标
    });

    // 用于存储合并后的数据
    let mergedData = [];
    // 用一个对象根据 location 和 feature 分组数据
    let groupedData = {};

    // 遍历 latestResults 中的数据，获取相关列数据
    latestResults.forEach(item => {
        // 确保 "分組值" 是一个对象，并从中正确获取 feature 和 value
        if (item["分組值"] && typeof item["分組值"] === 'object') {
            // 假设 "分組值" 是一个对象，获取对象的第一个键
            const keys = Object.keys(item["分組值"]);
            if (keys.length > 0) {
                let feature = keys[0];  // 获取第一个键作为 feature
                let value = item["分組值"][feature];  // 获取对应的值作为 value
                let percentage = item["佔比"];
                let location = item["地點"];
                let cha_nums = item["字數"];

                // console.log("正在处理 location:", location); // 打印正在处理的地点
                // 将数据按 location 和 feature 分组
                if (!groupedData[location]) {
                    groupedData[location] = {};
                }
                if (!groupedData[location][feature]) {
                    groupedData[location][feature] = {
                        items: [],
                        detailContent: []
                    };
                }

                // 判断字数 * 占比是否大于等于 0.06
                if (percentage * cha_nums >= 0.06) {
                    // 记录原始数据
                    groupedData[location][feature].detailContent.push({
                        value,
                        percentage
                    });
                }

                // 将数据项推入对应的分组
                groupedData[location][feature].items.push({
                    value,
                    percentage,
                    cha_nums
                });
                // console.log("处理完成：",location)
            }
        }
    });

    // 遍历所有分组的数据，进行合并
    for (let location in groupedData) {
        for (let feature in groupedData[location]) {
            let group = groupedData[location][feature].items;
            let more = [];
            let middle = [];
            let less = [];

            // 按占比分类
            group.forEach(item => {
                if (item.percentage >= 0.5) {
                    more.push(item.value);
                } else if (item.percentage >= 0.35) {
                    middle.push(item.value);
                } else if (item.percentage >= 0.2) {
                    less.push(item.value);
                }
            });

            // 合并后处理的值
            let finalValue = '';

            // 处理 "多" 的情况
            if (more.length > 0)
                if (more.length === 1) {
                    finalValue += more.join('');  // 直接拼接“多”
                } else {
                    finalValue += more.join('/');
                }
            // 处理 "中" 的情况
            if (middle.length > 0) {
                if (less.length === 0 && more.length === 0) {
                    // 如果没有 "少" 和 "多"，且只有一个 "中"，直接加上
                    if (middle.length === 1) {
                        finalValue += middle[0];  // 只有一个“中”，直接加上
                    } else {
                        finalValue += middle.join('/');  // 多个“中”，用斜杠分隔
                    }
                } else {
                    // 如果有 "少" 或者 "多"，则中使用括号包裹并用逗号分隔
                    finalValue += `(${middle.join(',')})`;
                }
            }

            // 处理 "少" 的情况
            if (less.length > 0) {
                finalValue += `(*${less.join(', *')})`;  // 用括号包住“少”，并加上 * 前缀
            }

            if (!finalValue) {
                finalValue = '散';
            }

            // 获取最大占比对应的 value
            let maxPercentageValue = groupedData[location][feature].detailContent.reduce((prev, current) => {
                return (prev.percentage > current.percentage) ? prev : current;
            }).value;

            // 最小化改动 - 获取对应地点的坐标并添加到 mergedData 中
            let coordinate = locationToCoordinates[location] || null; // 获取坐标，若没有则设为 null
            // const [lng, lat] = await convertCoordinates(coordinate);
            // 将合并后的数据推入 mergedData
            mergedData.push({
                location: location,
                feature: feature,
                value: finalValue,
                zoomLevel: zoomLevel,
                coordinate: coordinate,
                centerCoordinate: centerCoordinate,
                maxValue: maxPercentageValue,  // 添加最大占比对应的 value
                detailContent: groupedData[location][feature].detailContent // 详细记录
            });
        }
    }

    // 获取前端页面数据
    const locations = document.getElementById('locations').value.trim().split(/\s+/);
    const regions = document.getElementById('regions').value.trim().split(/\s+/);
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
        const token = localStorage.getItem("ACCESS_TOKEN")
        // 如果没有 token，直接返回，表示用户未登录
        if (!token) {
            shouldContinue = false;
            throw "用戶未登錄，不查詢個人數據";
        }
        // 用 URLSearchParams 拼接到 GET URL
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await fetch(`${window.API_BASE}/get_custom?${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });

        if (!response.ok) {
            // const errorData = await response.json().catch(() => ({}));
            // const errorMessage = errorData.detail || "後端返回錯誤";
            // alert(errorMessage);
            shouldContinue = false; // 标记不要继续往下处理
        }else {
            result = await response.json();
        }
        // result = shouldContinue ? await response.json() : null;
    } catch (error) {
        // console.error("请求失败:", error);
        // alert("請求失敗：" + error.message);
        shouldContinue = false;
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
    // console.log(mergedData)
    window.mergedData = mergedData;
    // console.log("mergedData存储完成");

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

function generateCharsMergedData(resultData, locationsData) {
    // 创建地点到坐标的映射
    let locationToCoordinates = {};
    locationsData.coordinates_locations.forEach(coord => {
        locationToCoordinates[coord[0]] = coord[1];  // coord[0] 是地点，coord[1] 是坐标
    });
    let notesString = "";  // 默认空字符串
    // 初始化 mergedData 数组
    let mergedData = [];
    // 生成 mergedData
    return resultData.map(item => {
        // 计算音节和 notes
        let syllablesString = item.音节.join('·');  // 拼接音节
        if (Array.isArray(item.notes) && item.notes.some(note => note !== "_")) {
            notesString = item.notes.join(' / ');  // 处理 notes（拼接非空的 notes）
        }

        // 获取坐标
        let coordinate = locationToCoordinates[item.location] || [0, 0];  // 默认坐标是 [0, 0]，如果没有找到则为默认值

        // 拼接到 mergedData
        mergedData.push({
            location: item.location,  // 使用 location 字段
            feature: item.char,  // 使用 char 字段作为 feature
            value: syllablesString,  // 拼接后的音节字符串
            zoomLevel: locationsData.zoom_level,  // 从 locationsData 获取 zoom_level
            coordinate: coordinate,  // 使用映射的坐标
            centerCoordinate: locationsData.center_coordinate,  // 从 locationsData 获取 center_coordinate
            maxValue: syllablesString,  // 与 value 相同
            detailContent: notesString  // 使用处理后的 notes 字符串
        });
        // 调用颜色分配函数
        assignColorToMergedData(mergedData);
        window.mergedData = mergedData;  // 不返回，而是存储在全局变量 window.mergedData 中
    });
}

// 新的函数：处理音调并分配颜色
function generateTonesMergedData(resultData, locationsData) {
    // 创建地点到坐标的映射
    let locationToCoordinates = {};
    locationsData.coordinates_locations.forEach(coord => {
        locationToCoordinates[coord[0]] = coord[1];  // coord[0] 是地点，coord[1] 是坐标
    });

    // 初始化 mergedData 数组
    let mergedData = [];

    resultData.forEach(item => {
        // 获取坐标
        let coordinate = locationToCoordinates[item.location] || [0, 0];  // 默认坐标是 [0, 0]，如果没有找到则为默认值
        // 拼接到 mergedData
        mergedData.push({
            location: item.location,  // 使用 location 字段
            feature: item.tone,  // 使用 char 字段作为 feature
            value: item.value,  // 拼接后的音节字符串
            zoomLevel: locationsData.zoom_level,  // 从 locationsData 获取 zoom_level
            coordinate: coordinate,  // 使用映射的坐标
            centerCoordinate: locationsData.center_coordinate,  // 从 locationsData 获取 center_coordinate
            maxValue: item.value,  // 与 value 相同
            detailContent: item.notes  // 使用处理后的 notes 字符串
        });
    });

    // 调用分配颜色的函数
    assignColorToMergedData(mergedData);

    // 将处理后的 mergedData 存储在 window.mergedData 中
    window.mergedData = mergedData;
}
