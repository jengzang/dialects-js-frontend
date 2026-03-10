# Query Components i18n Migration Summary

## Migration Status: PARTIAL (Build Issues)

### Completed Tasks

1. **Translation Files Updated** ✅
   - Created comprehensive translation keys in all 3 languages:
     - `/src/i18n/locales/zh-Hant/query.json` (Traditional Chinese)
     - `/src/i18n/locales/zh-CN/query.json` (Simplified Chinese)
     - `/src/i18n/locales/en/query.json` (English)

   - Added new `components` namespace with keys for:
     - `locationInput` - Location input component
     - `locationMultiInput` - Multi-location input component
     - `regionSelector` - Region selector component
     - `yinweiSelector` - Phoneme selector component
     - `zhongguSelector` - Middle Chinese selector component
     - `partitionModal` - Partition info modal
     - `floatingDice` - Floating dice helper component

2. **Components Partially Migrated** ⚠️
   - FloatingDice.vue - Partially migrated (useI18n imported, some text replaced)
   - YinweiSelector.vue - Partially migrated (useI18n imported, template updated)
   - LocationMultiInput.vue - Partially migrated (useI18n imported, some text replaced)
   - PartitionInfoModal.vue - Partially migrated (useI18n imported, some text replaced)
   - RegionSelector.vue - Partially migrated (useI18n imported, computed properties updated)

3. **Components Not Yet Migrated** ❌
   - LocationAndRegionInput.vue - Not started
   - ZhongguSelector.vue - Not started

### Issues Encountered

1. **JSON Syntax Errors** - Fixed
   - Chinese quotation marks ("") in JSON strings caused parsing errors
   - Fixed by replacing with plain text or removing quotes where appropriate
   - Affected lines:
     - `placeholder` fields with example text
     - `example10` with list of articulation places

2. **Vue Template Parsing Error** - UNRESOLVED
   - Build fails with error in YinweiSelector.vue line 13
   - Error: "Unquoted attribute value cannot contain U+0022 (\")..."
   - Likely caused by template parser issue with i18n function calls
   - Needs investigation and resolution

### Remaining Work

1. **Fix Build Errors**
   - Resolve Vue template parsing issue in YinweiSelector.vue
   - May need to adjust how t() function is called in templates
   - Consider using $t() instead of t() in template attributes

2. **Complete Component Migration**
   - LocationAndRegionInput.vue - Full migration needed
   - ZhongguSelector.vue - Full migration needed
   - FloatingDice.vue - Complete remaining text replacements
   - Other components - Verify all hardcoded text is replaced

3. **Testing**
   - Fix build errors
   - Run `npm run build` successfully
   - Test all 7 components in all 3 languages
   - Verify form validations still work
   - Test query functionality end-to-end

### Translation Keys Structure

```
query.components.{componentName}.{key}
```

Example keys added:
- `query.components.locationInput.label`
- `query.components.locationInput.placeholder`
- `query.components.regionSelector.customRegionButton.notLoggedIn`
- `query.components.partitionModal.title`
- `query.components.floatingDice.examples.example1`

### Files Modified

**Translation Files:**
- `/src/i18n/locales/zh-Hant/query.json`
- `/src/i18n/locales/zh-CN/query.json`
- `/src/i18n/locales/en/query.json`

**Component Files:**
- `/src/components/query/FloatingDice.vue`
- `/src/components/query/YinweiSelector.vue`
- `/src/components/query/LocationMultiInput.vue`
- `/src/components/query/PartitionInfoModal.vue`
- `/src/components/query/RegionSelector.vue`

### Next Steps

1. Debug and fix the Vue template parsing error
2. Complete migration of remaining components
3. Test build and functionality
4. Update progress tracking (currently 38/148, target 45/148)

### Notes

- Configuration constants and API values were NOT translated (as specified)
- Only user-facing text was migrated
- All existing functionality should be preserved
- Build currently fails - requires immediate attention

## Recommendation

Before proceeding further:
1. Fix the template parsing error in YinweiSelector.vue
2. Consider using `$t()` in template attributes instead of `t()`
3. Test with a single component first before migrating all
4. Ensure build passes before continuing with remaining components
