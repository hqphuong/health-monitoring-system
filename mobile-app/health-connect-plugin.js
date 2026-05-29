const { withMainActivity, withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Expo Config Plugin để tự động khởi tạo Health Connect trong MainActivity.kt
 * Giúp sửa lỗi: UninitializedPropertyAccessException: lateinit property requestPermission has not been initialized
 */
const withHealthConnectInit = (config) => {
  config = withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    // 1. Thêm import nếu chưa có
    const androidImport = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
    if (!contents.includes(androidImport)) {
      // Tìm vị trí sau dòng package để chèn import
      contents = contents.replace(
        /(package .*\n)/,
        `$1\n${androidImport}\n`
      );
    }

    // 2. Thêm dòng khởi tạo vào cuối hàm onCreate
    const initCode = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';
    if (!contents.includes(initCode)) {
      // Tìm dòng super.onCreate(...) và chèn sau đó
      // Thử khớp với cả Java và Kotlin style
      contents = contents.replace(
        /(super\.onCreate\(.*\))/,
        `$1\n    ${initCode}`
      );
    }

    config.modResults.contents = contents;
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    const activityName = '.MainActivity';

    // Android 13 and below: permission rationale entry point.
    const hasRationaleActivity = (app.activity || []).some(
      (activity) =>
        activity.$?.['android:name'] === activityName &&
        (activity['intent-filter'] || []).some((intentFilter) =>
          (intentFilter.action || []).some(
            (action) =>
              action.$?.['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
          )
        )
    );

    if (!hasRationaleActivity) {
      app.activity = app.activity || [];
      app.activity.push({
        $: {
          'android:name': activityName,
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
          },
        ],
      });
    }

    // Android 14+: required VIEW_PERMISSION_USAGE handler.
    const hasViewPermissionAlias = (app['activity-alias'] || []).some(
      (alias) => alias.$?.['android:name'] === 'ViewPermissionUsageActivity'
    );

    if (!hasViewPermissionAlias) {
      app['activity-alias'] = app['activity-alias'] || [];
      app['activity-alias'].push({
        $: {
          'android:name': 'ViewPermissionUsageActivity',
          'android:exported': 'true',
          'android:targetActivity': activityName,
          'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
            category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
          },
        ],
      });
    }

    return config;
  });

  return config;
};

module.exports = withHealthConnectInit;
