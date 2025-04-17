$files = Get-ChildItem -Path "nestjs-api-ecm\src\backend\dashboard" -Filter "dashboard.controller.*.spec.ts" | Where-Object { 
    $_.Name -ne "dashboard.controller.common.spec.ts" -and 
    $_.Name -ne "dashboard.controller.spec.ts" -and 
    $_.Name -ne "dashboard.controller.summaryStatistic.spec.ts" -and 
    $_.Name -ne "dashboard.controller.getFeatureProduct.spec.ts" -and
    $_.Name -ne "dashboard.controller.getFinancialSummary.spec.ts"
}

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Kiểm tra xem file đã có mock cho responseHandler chưa
    if ($content -notmatch "jest\.mock\('src/Until/responseUtil'") {
        # Tìm vị trí để chèn mock
        $pattern = "import \{ createTestingModule, createMockDashboardService \} from './dashboard\.controller\.common\.spec';"
        $replacement = @"
import { createTestingModule, createMockDashboardService } from './dashboard.controller.common.spec';

/**
 * Mock cho responseHandler
 * Mô tả: Tạo mock cho responseHandler để kiểm tra các phản hồi từ controller
 */
jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    ok: jest.fn(data => ({ success: true, data, status: 200, message: 'SUCCESS!' })),
    error: jest.fn(message => ({ success: false, status: 500, message: message || 'Internal server error' })),
  },
}));
"@
        $newContent = $content -replace $pattern, $replacement
        
        # Lưu nội dung mới vào file
        Set-Content -Path $file.FullName -Value $newContent
        
        Write-Host "Updated file: $($file.Name)"
    } else {
        Write-Host "File already has mock: $($file.Name)"
    }
}

Write-Host "All files updated successfully!"
