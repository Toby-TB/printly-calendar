'use strict';

/* ============================================================
   拾光行事历 · 核心逻辑（简体 / 繁体 / English 三语版）
   ============================================================ */

/* ---------- 工具函数 ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const pad2 = (n) => String(n).padStart(2, '0');
const dateKeyOf = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const keyOf = (date) => dateKeyOf(date.getFullYear(), date.getMonth(), date.getDate());
const todayKey = () => keyOf(new Date());
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const k = clamp(t, 0, 1);
  return '#' + A.map((v, i) => pad2(Math.round(v + (B[i] - v) * k).toString(16))).join('');
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* ---------- 多语言字典 ---------- */
const I18N = {
  'zh-CN': {
    appTitle: '拾光行事历 · 月历打印工坊',
    brandName: '拾光行事历',
    brandTag: '月视图 · DIY 风格 · 打印装订',
    titlePrevMonth: '上个月', titleNextMonth: '下个月', titleCatColor: '分类颜色', titleClose: '关闭', titleDeleteCat: '删除分类',
    btnToday: '今天', btnPreview: '🖨 打印预览', btnPrint: '打印',
    tabSchedule: '📋 日程', tabDesign: '🎨 设计', tabPrint: '🖨 打印',
    catLegend: '分类图例', catLegendTip: '点击可隐藏 / 显示',
    newCatPlaceholder: '新分类名', btnAddCat: '添加',
    monthEventsTitle: '本月日程',
    dataTitle: '数据', btnExport: '导出 JSON', btnImport: '导入', btnClear: '清空日程',
    dataTip: '日程自动保存在本机浏览器（localStorage），换设备可通过 JSON 迁移。',
    themeTitle: '预设模板', customTitle: '自定义风格',
    labelAccent: '主色', labelPage: '纸张背景', labelPattern: '背景纹理', labelFont: '字体', labelRadius: '圆角',
    labelBgImage: '自定义背景图', btnUploadImage: '上传图片', btnRemove: '移除',
    bgTipDefault: '背景图仅作装饰，不会随日程数据导出。',
    bgTipUsed: '已使用自定义背景图，点击「移除」恢复纯色。',
    elementsTitle: '元素开关', swHoles: '打印装订孔标记', swDecor: '装饰角标', swGrid: '网格线', swWeekend: '周末底纹',
    weekStartTitle: '周起始', weekStartLabel: '一周从哪一天开始', optMonday: '周一', optSunday: '周日',
    printRangeTitle: '选择日期范围', labelStartMonth: '起始月份', labelEndMonth: '结束月份',
    btnRangeYear: '本年度', btnRangeNext12: '未来 12 个月',
    pageOptsTitle: '页面选项', swCover: '首页封面', labelCoverTitle: '封面标题', coverPlaceholder: '拾光行事历', swNotes: '底部备注区',
    printTitle: '打印', btnBuildPreview: '生成打印预览', btnPrintDirect: '直接打印',
    printTip: '每页顶部自动预留 26mm 装订区，适合打圆孔 / 装订圈合成册。打印页包含全部分类（屏幕上的隐藏不影响打印）。打印时请在浏览器中开启「背景图形」。',
    footAdd: '点击日期 → 添加日程', footEdit: '点击色条 → 编辑日程', footBind: '打印页顶部留白 → 打孔装订',
    modalAdd: '添加日程', modalEdit: '编辑日程',
    labelTitle: '标题 *', titlePlaceholder: '例如：团队周会',
    labelStartDate: '开始日期', labelEndDate: '结束日期（可选）', labelTime: '时间（可选）',
    labelCat: '分类', labelNote: '备注', notePlaceholder: '地点、细节……',
    btnSave: '保存', btnDelete: '删除', btnCancel: '取消', fullDay: '全天',
    emptyMonth: '本月暂无日程<br>点击日历上的日期添加一条吧 ✍️',
    emptyDay: '这一天还没有日程',
    moreLabel: '+{n} 更多',
    monthLabelFmt: '{y}年 {m}月',
    monthEventsTitleFmt: '{y}年 {m}月日程 · {n} 项',
    dayListTitleFmt: '{y}年{m}月{d}日 当日日程 · {n} 项',
    pYearFmt: '{y} 年 · {month}',
    pTitleNum: '{m} 月',
    pSubFmt: '{monthEn} {y} · {month}',
    coverSub: 'MONTHLY PLANNER · 月历打印手帐',
    coverMonthFmt: '{m}月',
    bindingGuide: '装订区 · 顶部留白 26mm',
    notes: '备注',
    previewBar: '打印预览 · 共 {n} 页 · 日期范围 {m} 个月',
    btnPrintPreview: '🖨 打印', btnClose: '关闭',
    unnamedEvent: '未命名',
    toastSaveFail: '保存失败：浏览器存储空间不足（背景图可能过大）',
    toastTitleRequired: '请填写日程标题',
    toastDateRequired: '请选择开始日期',
    toastEndBeforeStart: '结束日期不能早于开始日期',
    toastSaved: '日程已保存',
    toastDeleted: '日程已删除',
    toastExported: '数据已导出',
    toastImported: '已导入 {n} 条日程',
    toastImportFail: '导入失败：文件格式不正确',
    toastThemeApplied: '已应用「{name}」模板',
    toastCatName: '请输入分类名',
    toastCatAdded: '已添加分类「{name}」',
    toastCleared: '已清空全部日程',
    toastBgApplied: '背景图已应用',
    toastBgRemoved: '已移除背景图',
    toastRangeYear: '已选择 {y} 全年',
    toastRangeNext12: '已选择未来 12 个月',
    confirmDeleteEvent: '确定删除这条日程吗？',
    confirmDeleteCat: '删除该分类？原日程会归入「其他」。',
    confirmClear: '确定清空全部日程吗？此操作不可恢复。',
    exportFileBase: '拾光行事历-数据',
    sample1Title: '团队周会', sample1Note: '会议室 B',
    sample2Title: '妈妈生日', sample2Note: '准备蛋糕和花',
    sample3Title: '年度体检', sample3Note: '记得空腹',
    sample4Title: '读书打卡', sample4Note: '《小王子》'
  },

  'zh-TW': {
    appTitle: '拾光行事曆 · 月曆列印工坊',
    brandName: '拾光行事曆',
    brandTag: '月檢視 · DIY 風格 · 列印裝訂',
    titlePrevMonth: '上個月', titleNextMonth: '下個月', titleCatColor: '分類顏色', titleClose: '關閉', titleDeleteCat: '刪除分類',
    btnToday: '今天', btnPreview: '🖨 列印預覽', btnPrint: '列印',
    tabSchedule: '📋 行程', tabDesign: '🎨 設計', tabPrint: '🖨 列印',
    catLegend: '分類圖例', catLegendTip: '點擊可隱藏 / 顯示',
    newCatPlaceholder: '新分類名', btnAddCat: '新增',
    monthEventsTitle: '本月行程',
    dataTitle: '資料', btnExport: '匯出 JSON', btnImport: '匯入', btnClear: '清空行程',
    dataTip: '行程自動儲存在本機瀏覽器（localStorage），更換裝置可透過 JSON 移轉。',
    themeTitle: '預設範本', customTitle: '自訂風格',
    labelAccent: '主色', labelPage: '紙張背景', labelPattern: '背景紋理', labelFont: '字型', labelRadius: '圓角',
    labelBgImage: '自訂背景圖', btnUploadImage: '上傳圖片', btnRemove: '移除',
    bgTipDefault: '背景圖僅作裝飾，不會隨行程資料匯出。',
    bgTipUsed: '已使用自訂背景圖，點擊「移除」恢復純色。',
    elementsTitle: '元素開關', swHoles: '列印裝訂孔標記', swDecor: '裝飾角標', swGrid: '網格線', swWeekend: '週末底紋',
    weekStartTitle: '週起始', weekStartLabel: '一週從哪一天開始', optMonday: '週一', optSunday: '週日',
    printRangeTitle: '選擇日期範圍', labelStartMonth: '起始月份', labelEndMonth: '結束月份',
    btnRangeYear: '本年度', btnRangeNext12: '未來 12 個月',
    pageOptsTitle: '頁面選項', swCover: '首頁封面', labelCoverTitle: '封面標題', coverPlaceholder: '拾光行事曆', swNotes: '底部備註區',
    printTitle: '列印', btnBuildPreview: '產生列印預覽', btnPrintDirect: '直接列印',
    printTip: '每頁頂部自動預留 26mm 裝訂區，適合打圓孔 / 裝訂圈合成冊。列印頁包含全部分類（螢幕上的隱藏不影響列印）。列印時請在瀏覽器中開啟「背景圖形」。',
    footAdd: '點擊日期 → 新增行程', footEdit: '點擊色條 → 編輯行程', footBind: '列印頁頂部留白 → 打孔裝訂',
    modalAdd: '新增行程', modalEdit: '編輯行程',
    labelTitle: '標題 *', titlePlaceholder: '例如：團隊週會',
    labelStartDate: '開始日期', labelEndDate: '結束日期（可選）', labelTime: '時間（可選）',
    labelCat: '分類', labelNote: '備註', notePlaceholder: '地點、細節……',
    btnSave: '儲存', btnDelete: '刪除', btnCancel: '取消', fullDay: '全天',
    emptyMonth: '本月暫無行程<br>點擊日曆上的日期新增一筆吧 ✍️',
    emptyDay: '這一天還沒有行程',
    moreLabel: '+{n} 更多',
    monthLabelFmt: '{y} 年 {m} 月',
    monthEventsTitleFmt: '{y} 年 {m} 月行程 · {n} 項',
    dayListTitleFmt: '{y}年{m}月{d}日 當日行程 · {n} 項',
    pYearFmt: '{y} 年 · {month}',
    pTitleNum: '{m} 月',
    pSubFmt: '{monthEn} {y} · {month}',
    coverSub: 'MONTHLY PLANNER · 月曆列印手帳',
    coverMonthFmt: '{m}月',
    bindingGuide: '裝訂區 · 頂部留白 26mm',
    notes: '備註',
    previewBar: '列印預覽 · 共 {n} 頁 · 日期範圍 {m} 個月',
    btnPrintPreview: '🖨 列印', btnClose: '關閉',
    unnamedEvent: '未命名',
    toastSaveFail: '儲存失敗：瀏覽器儲存空間不足（背景圖可能過大）',
    toastTitleRequired: '請填寫行程標題',
    toastDateRequired: '請選擇開始日期',
    toastEndBeforeStart: '結束日期不能早於開始日期',
    toastSaved: '行程已儲存',
    toastDeleted: '行程已刪除',
    toastExported: '資料已匯出',
    toastImported: '已匯入 {n} 筆行程',
    toastImportFail: '匯入失敗：檔案格式不正確',
    toastThemeApplied: '已套用「{name}」範本',
    toastCatName: '請輸入分類名稱',
    toastCatAdded: '已新增分類「{name}」',
    toastCleared: '已清空全部行程',
    toastBgApplied: '背景圖已套用',
    toastBgRemoved: '已移除背景圖',
    toastRangeYear: '已選擇 {y} 全年',
    toastRangeNext12: '已選擇未來 12 個月',
    confirmDeleteEvent: '確定刪除這筆行程嗎？',
    confirmDeleteCat: '刪除該分類？原行程會歸入「其他」。',
    confirmClear: '確定清空全部行程嗎？此操作無法復原。',
    exportFileBase: '拾光行事曆-資料',
    sample1Title: '團隊週會', sample1Note: '會議室 B',
    sample2Title: '媽媽生日', sample2Note: '準備蛋糕和花',
    sample3Title: '年度體檢', sample3Note: '記得空腹',
    sample4Title: '讀書打卡', sample4Note: '《小王子》'
  },

  en: {
    appTitle: 'Calendar Studio · Monthly Print',
    brandName: 'Calendar Studio',
    brandTag: 'Month view · DIY themes · Print & bind',
    titlePrevMonth: 'Previous month', titleNextMonth: 'Next month', titleCatColor: 'Category color', titleClose: 'Close', titleDeleteCat: 'Delete category',
    btnToday: 'Today', btnPreview: '🖨 Print preview', btnPrint: 'Print',
    tabSchedule: '📋 Events', tabDesign: '🎨 Design', tabPrint: '🖨 Print',
    catLegend: 'Category legend', catLegendTip: 'Click to hide / show',
    newCatPlaceholder: 'New category', btnAddCat: 'Add',
    monthEventsTitle: 'Month events',
    dataTitle: 'Data', btnExport: 'Export JSON', btnImport: 'Import', btnClear: 'Clear events',
    dataTip: 'Events are stored locally in your browser (localStorage). Use JSON to move between devices.',
    themeTitle: 'Preset templates', customTitle: 'Custom style',
    labelAccent: 'Accent', labelPage: 'Paper background', labelPattern: 'Background pattern', labelFont: 'Font', labelRadius: 'Corner radius',
    labelBgImage: 'Custom background image', btnUploadImage: 'Upload image', btnRemove: 'Remove',
    bgTipDefault: 'Background image is decorative only and is not exported with your data.',
    bgTipUsed: 'Custom background in use — click Remove to restore a plain color.',
    elementsTitle: 'Elements', swHoles: 'Punch-hole marks on print', swDecor: 'Corner decorations', swGrid: 'Grid lines', swWeekend: 'Weekend shading',
    weekStartTitle: 'Week start', weekStartLabel: 'Week starts on', optMonday: 'Monday', optSunday: 'Sunday',
    printRangeTitle: 'Select date range', labelStartMonth: 'Start month', labelEndMonth: 'End month',
    btnRangeYear: 'This year', btnRangeNext12: 'Next 12 months',
    pageOptsTitle: 'Page options', swCover: 'Cover page', labelCoverTitle: 'Cover title', coverPlaceholder: 'My Calendar', swNotes: 'Notes area at bottom',
    printTitle: 'Print', btnBuildPreview: 'Generate print preview', btnPrintDirect: 'Print directly',
    printTip: 'Each page reserves a 26mm top binding area for ring/hole binding. Printed pages include all categories (hiding a category on screen does not affect printing). Enable "Background graphics" in the browser print dialog.',
    footAdd: 'Click a date → add event', footEdit: 'Click a chip → edit event', footBind: 'Top margin on print pages → punch & bind',
    modalAdd: 'Add event', modalEdit: 'Edit event',
    labelTitle: 'Title *', titlePlaceholder: 'e.g. Weekly team meeting',
    labelStartDate: 'Start date', labelEndDate: 'End date (optional)', labelTime: 'Time (optional)',
    labelCat: 'Category', labelNote: 'Note', notePlaceholder: 'Place, details…',
    btnSave: 'Save', btnDelete: 'Delete', btnCancel: 'Cancel', fullDay: 'All day',
    emptyMonth: 'No events this month<br>Click a date on the calendar to add one ✍️',
    emptyDay: 'No events on this day',
    moreLabel: '+{n} more',
    monthLabelFmt: '{month} {y}',
    monthEventsTitleFmt: '{month} {y} · {n} events',
    dayListTitleFmt: '{month} {d}, {y} · {n} events',
    pYearFmt: '{y} · {month}',
    pTitleNum: '{month}',
    pSubFmt: '{month} {y} · Monthly',
    coverSub: 'MONTHLY PLANNER · PRINT & BIND',
    coverMonthFmt: '{monthShort}',
    bindingGuide: 'BINDING AREA · 26mm TOP MARGIN',
    notes: 'NOTES',
    previewBar: 'Print preview · {n} pages · {m} months',
    btnPrintPreview: '🖨 Print', btnClose: 'Close',
    unnamedEvent: 'Untitled',
    toastSaveFail: 'Save failed: browser storage is full (the background image may be too large).',
    toastTitleRequired: 'Please enter an event title.',
    toastDateRequired: 'Please choose a start date.',
    toastEndBeforeStart: 'End date cannot be earlier than start date.',
    toastSaved: 'Event saved.',
    toastDeleted: 'Event deleted.',
    toastExported: 'Data exported.',
    toastImported: 'Imported {n} events.',
    toastImportFail: 'Import failed: invalid file format.',
    toastThemeApplied: 'Applied "{name}" template.',
    toastCatName: 'Please enter a category name.',
    toastCatAdded: 'Added category "{name}".',
    toastCleared: 'All events cleared.',
    toastBgApplied: 'Background image applied.',
    toastBgRemoved: 'Background image removed.',
    toastRangeYear: 'Selected the whole year {y}.',
    toastRangeNext12: 'Selected the next 12 months.',
    confirmDeleteEvent: 'Delete this event?',
    confirmDeleteCat: 'Delete this category? Existing events will move to "Other".',
    confirmClear: 'Clear all events? This cannot be undone.',
    exportFileBase: 'calendar-data',
    sample1Title: 'Weekly team meeting', sample1Note: 'Meeting room B',
    sample2Title: "Mom's birthday", sample2Note: 'Prepare a cake and flowers',
    sample3Title: 'Annual check-up', sample3Note: 'Remember to fast',
    sample4Title: 'Reading time', sample4Note: 'The Little Prince'
  }
};

/* ---------- 本地化名称 ---------- */
const MONTHS_LOC = {
  'zh-CN': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  'zh-TW': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const WEEK_SHORT_LOC = {
  'zh-CN': ['日', '一', '二', '三', '四', '五', '六'],
  'zh-TW': ['日', '一', '二', '三', '四', '五', '六'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};

const WEEK_FULL_LOC = {
  'zh-CN': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  'zh-TW': ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

/* ---------- 预设字体 / 纹理 ---------- */
const FONTS = [
  { name: { 'zh-CN': '系统黑体', 'zh-TW': '系統黑體', en: 'System Sans' }, css: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' },
  { name: { 'zh-CN': '宋体衬线', 'zh-TW': '宋體襯線', en: 'Serif' }, css: 'Georgia, "Times New Roman", "Songti SC", SimSun, serif' },
  { name: { 'zh-CN': '楷体手帐', 'zh-TW': '楷體手帳', en: 'Kaiti Script' }, css: '"Kaiti SC", "STKaiti", "KaiTi", "TW-Kai", "AR PL UKai CN", serif' },
  { name: { 'zh-CN': '圆体可爱', 'zh-TW': '圓體可愛', en: 'Rounded' }, css: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Comic Sans MS", "Chalkboard SE", sans-serif' },
  { name: { 'zh-CN': '细黑极简', 'zh-TW': '細黑極簡', en: 'Thin Sans' }, css: '"Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", sans-serif' }
];

const PATTERNS = [
  { id: 'none', name: { 'zh-CN': '无纹理', 'zh-TW': '無紋理', en: 'None' }, css: 'none', size: '0 0' },
  { id: 'dots', name: { 'zh-CN': '波点', 'zh-TW': '波點', en: 'Dots' }, css: 'radial-gradient(circle, var(--pattern-color) 1.2px, transparent 1.7px)', size: '18px 18px' },
  { id: 'grid', name: { 'zh-CN': '方格', 'zh-TW': '方格', en: 'Grid' }, css: 'linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--pattern-color) 1px, transparent 1px)', size: '22px 22px' },
  { id: 'lines', name: { 'zh-CN': '横线', 'zh-TW': '橫線', en: 'Lines' }, css: 'repeating-linear-gradient(transparent, transparent 5px, var(--pattern-color) 5px, var(--pattern-color) 6px)', size: '100% 6px' },
  { id: 'diag', name: { 'zh-CN': '斜纹', 'zh-TW': '斜紋', en: 'Diagonal' }, css: 'repeating-linear-gradient(45deg, var(--pattern-color) 0 1px, transparent 1px 9px)', size: 'auto' },
  { id: 'stars', name: { 'zh-CN': '星点', 'zh-TW': '星點', en: 'Star dots' }, css: 'radial-gradient(circle, var(--pattern-color) 1px, transparent 1.4px) 0 0/26px 26px, radial-gradient(circle, var(--pattern-color) 1px, transparent 1.4px) 13px 13px/26px 26px', size: 'auto' }
];

/* ---------- 预设模板 ---------- */
const THEMES = {
  cream: {
    name: { 'zh-CN': '奶油手账', 'zh-TW': '奶油手帳', en: 'Cream Journal' },
    desc: { 'zh-CN': '温暖奶油 · 手帐风', 'zh-TW': '溫暖奶油 · 手帳風', en: 'Warm cream · journal style' },
    swatch: 'linear-gradient(135deg, #f7e8dc 0%, #e6c39a 55%, #c98a5e 100%)',
    accent: '#c98a5e', backdrop: '#f3e9da', page: '#fffdf8',
    inkDark: '#5a4632', inkLight: '#f4ede2', weekend: '#d96a6a',
    pattern: 'dots', font: FONTS[2].css, radius: 14, decor: '✿'
  },
  matcha: {
    name: { 'zh-CN': '抹茶清新', 'zh-TW': '抹茶清新', en: 'Matcha Fresh' },
    desc: { 'zh-CN': '低饱和绿 · 清爽', 'zh-TW': '低飽和綠 · 清爽', en: 'Muted green · fresh' },
    swatch: 'linear-gradient(135deg, #e8f1e2 0%, #a9c6a2 55%, #5f8f6b 100%)',
    accent: '#5f8f6b', backdrop: '#eaf1e6', page: '#fbfdf8',
    inkDark: '#3d4a3d', inkLight: '#eef5ea', weekend: '#c96f5a',
    pattern: 'grid', font: FONTS[0].css, radius: 12, decor: '❋'
  },
  morandi: {
    name: { 'zh-CN': '莫兰迪', 'zh-TW': '莫蘭迪', en: 'Morandi' },
    desc: { 'zh-CN': '灰调 · 安静高级', 'zh-TW': '灰調 · 安靜高級', en: 'Muted grey · quiet' },
    swatch: 'linear-gradient(135deg, #e8e9ec 0%, #b9c0cc 55%, #8d99ae 100%)',
    accent: '#8d99ae', backdrop: '#e8e9ec', page: '#f6f7f8',
    inkDark: '#4a5560', inkLight: '#eef1f5', weekend: '#b5817f',
    pattern: 'none', font: FONTS[0].css, radius: 8, decor: '◆'
  },
  kraft: {
    name: { 'zh-CN': '复古牛皮纸', 'zh-TW': '復古牛皮紙', en: 'Vintage Kraft' },
    desc: { 'zh-CN': '做旧纸张 · 复古', 'zh-TW': '做舊紙張 · 復古', en: 'Aged paper · vintage' },
    swatch: 'linear-gradient(135deg, #f0e4c8 0%, #d8bd90 55%, #b5733f 100%)',
    accent: '#b5733f', backdrop: '#d9c9a8', page: '#f3e9d2',
    inkDark: '#5a4632', inkLight: '#f2e7cf', weekend: '#c05f4f',
    pattern: 'lines', font: FONTS[2].css, radius: 6, decor: '❦'
  },
  sakura: {
    name: { 'zh-CN': '樱花粉', 'zh-TW': '櫻花粉', en: 'Sakura Pink' },
    desc: { 'zh-CN': '粉嫩 · 温柔浪漫', 'zh-TW': '粉嫩 · 溫柔浪漫', en: 'Soft pink · romantic' },
    swatch: 'linear-gradient(135deg, #fdeaf0 0%, #f3bccb 55%, #e58aa5 100%)',
    accent: '#e58aa5', backdrop: '#f9e7ec', page: '#fffafc',
    inkDark: '#6b4a56', inkLight: '#fdeef2', weekend: '#e07a8a',
    pattern: 'dots', font: FONTS[3].css, radius: 16, decor: '✿'
  },
  midnight: {
    name: { 'zh-CN': '午夜蓝', 'zh-TW': '午夜藍', en: 'Midnight Blue' },
    desc: { 'zh-CN': '深色夜空 · 星点', 'zh-TW': '深色夜空 · 星點', en: 'Dark night · star specks' },
    swatch: 'linear-gradient(135deg, #202a3d 0%, #33415f 55%, #7aa2ff 100%)',
    accent: '#7aa2ff', backdrop: '#151c2b', page: '#202a3d',
    inkDark: '#2a3550', inkLight: '#e8ecf5', weekend: '#ff9c9c',
    pattern: 'stars', font: FONTS[0].css, radius: 12, decor: '✦'
  },
  minimal: {
    name: { 'zh-CN': '极简白', 'zh-TW': '極簡白', en: 'Minimal White' },
    desc: { 'zh-CN': '黑白 · 干净利落', 'zh-TW': '黑白 · 乾淨俐落', en: 'Black & white · clean' },
    swatch: 'linear-gradient(135deg, #ffffff 0%, #d7d9dc 55%, #111827 100%)',
    accent: '#111827', backdrop: '#f0f0ec', page: '#ffffff',
    inkDark: '#1f2937', inkLight: '#f5f5f4', weekend: '#dc2626',
    pattern: 'none', font: FONTS[4].css, radius: 4, decor: '·'
  },
  ocean: {
    name: { 'zh-CN': '海盐蓝', 'zh-TW': '海鹽藍', en: 'Sea Salt Blue' },
    desc: { 'zh-CN': '清透蓝 · 海风', 'zh-TW': '清透藍 · 海風', en: 'Clear blue · sea breeze' },
    swatch: 'linear-gradient(135deg, #e3f1f8 0%, #a9d2ea 55%, #3d9bd9 100%)',
    accent: '#3d9bd9', backdrop: '#e3f1f8', page: '#fbfeff',
    inkDark: '#2f4b5f', inkLight: '#eaf5fb', weekend: '#d97757',
    pattern: 'diag', font: FONTS[3].css, radius: 10, decor: '❂'
  }
};

const DEFAULT_CATS = [
  { id: 'work', name: { 'zh-CN': '工作', 'zh-TW': '工作', en: 'Work' }, color: '#3b82f6', custom: false },
  { id: 'life', name: { 'zh-CN': '生活', 'zh-TW': '生活', en: 'Life' }, color: '#10b981', custom: false },
  { id: 'important', name: { 'zh-CN': '重要', 'zh-TW': '重要', en: 'Important' }, color: '#ef4444', custom: false },
  { id: 'anniv', name: { 'zh-CN': '纪念日', 'zh-TW': '紀念日', en: 'Anniversary' }, color: '#ec4899', custom: false },
  { id: 'study', name: { 'zh-CN': '学习', 'zh-TW': '學習', en: 'Study' }, color: '#f59e0b', custom: false },
  { id: 'other', name: { 'zh-CN': '其他', 'zh-TW': '其他', en: 'Other' }, color: '#8b5cf6', custom: false }
];

const LS_SETTINGS = 'printly-calendar-settings-v1';
const LS_EVENTS = 'printly-calendar-events-v1';

/* ---------- 语言辅助 ---------- */
function detectLang() {
  try {
    const n = String(navigator.language || 'zh-CN').toLowerCase();
    if (n.startsWith('zh')) {
      if (/tw|hk|mo|hant/.test(n)) return 'zh-TW';
      return 'zh-CN';
    }
    if (n.startsWith('en')) return 'en';
  } catch (err) { /* ignore */ }
  return 'zh-CN';
}

function currentLang() {
  const l = state.settings && state.settings.lang;
  return I18N[l] ? l : 'zh-CN';
}

function t(key, params) {
  const dict = I18N[currentLang()] || I18N['zh-CN'];
  let s = dict[key];
  if (s === undefined) s = I18N['zh-CN'][key];
  if (s === undefined) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

const monthName = (m) => MONTHS_LOC[currentLang()][m];
const weekShort = (d) => WEEK_SHORT_LOC[currentLang()][d];
const weekFull = (d) => WEEK_FULL_LOC[currentLang()][d];

function themeName(id) {
  const th = THEMES[id];
  if (!th) return id;
  return th.name[currentLang()] || th.name['zh-CN'];
}

function themeDesc(id) {
  const th = THEMES[id];
  if (!th) return '';
  return th.desc[currentLang()] || th.desc['zh-CN'];
}

function patternName(p) {
  return (p.name[currentLang()] || p.name['zh-CN']);
}

function fontName(f) {
  return (f.name[currentLang()] || f.name['zh-CN']);
}

function catName(c) {
  if (!c) return '';
  if (c.name && typeof c.name === 'object') return c.name[currentLang()] || c.name['zh-CN'] || c.name;
  return c.name || '';
}

/* ---------- 默认数据 ---------- */
function defaultSettings() {
  const y = new Date().getFullYear();
  const lang = detectLang();
  const coverDefaults = { 'zh-CN': '拾光行事历', 'zh-TW': '拾光行事曆', en: 'Calendar Studio' };
  return {
    themeId: 'cream',
    lang,
    custom: {
      accent: THEMES.cream.accent,
      page: THEMES.cream.page,
      pattern: THEMES.cream.pattern,
      font: THEMES.cream.font,
      radius: THEMES.cream.radius,
      bgImage: ''
    },
    startWeek: 1,
    showHoles: true,
    showDecor: true,
    gridLines: true,
    weekendShade: true,
    includeCover: true,
    coverTitle: coverDefaults[lang] || '拾光行事历',
    showNotes: true,
    printStart: `${y}-01`,
    printEnd: `${y}-12`
  };
}

function sampleEvents() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const d = (day) => dateKeyOf(y, m, day);
  const next = new Date(y, m + 1, 1);
  return [
    { id: 'sample-1', title: t('sample1Title'), start: d(5), end: '', time: '10:00', category: 'work', note: t('sample1Note') },
    { id: 'sample-2', title: t('sample2Title'), start: d(12), end: '', time: '', category: 'anniv', note: t('sample2Note') },
    { id: 'sample-3', title: t('sample3Title'), start: d(16), end: '', time: '08:30', category: 'important', note: t('sample3Note') },
    { id: 'sample-4', title: t('sample4Title'), start: d(20), end: dateKeyOf(next.getFullYear(), next.getMonth(), 5), time: '', category: 'study', note: t('sample4Note') }
  ];
}

/* ---------- 存取 ---------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    toast(t('toastSaveFail'));
  }
}

function mergeSettings(base, saved) {
  const out = Object.assign({}, base, saved || {});
  out.custom = Object.assign({}, base.custom, (saved && saved.custom) || {});
  return out;
}

/* ---------- 全局状态 ---------- */
const now = new Date();
const state = {
  view: { y: now.getFullYear(), m: now.getMonth() },
  settings: mergeSettings(defaultSettings(), loadJSON(LS_SETTINGS, null)),
  events: [],
  hiddenCats: new Set(),
  modal: { id: null, date: null }
};

const loadedEvents = loadJSON(LS_EVENTS, null);
state.events = Array.isArray(loadedEvents) ? loadedEvents : sampleEvents();

/* ---------- 主题应用 ---------- */
function effectiveTheme() {
  const t = THEMES[state.settings.themeId] || THEMES.cream;
  const c = state.settings.custom || {};
  return {
    ...t,
    accent: c.accent || t.accent,
    page: c.page || t.page,
    pattern: c.pattern !== undefined ? c.pattern : t.pattern,
    font: c.font || t.font,
    radius: c.radius !== undefined ? c.radius : t.radius,
    bgImage: c.bgImage || ''
  };
}

function applySettings() {
  const s = state.settings;
  const t = effectiveTheme();
  const root = document.documentElement;
  const dark = luminance(t.page) < 0.5;
  const ink = dark ? t.inkLight : t.inkDark;
  const cellBg = mixHex(t.page, t.accent, dark ? 0.10 : 0.05);
  const accentSoft = mixHex(t.page, t.accent, dark ? 0.24 : 0.16);
  const weekendSoft = mixHex(t.page, t.weekend, dark ? 0.18 : 0.12);
  const accentContrast = luminance(t.accent) > 0.55 ? '#1b1b1b' : '#ffffff';
  const pat = PATTERNS.find((p) => p.id === t.pattern) || PATTERNS[0];

  root.style.setProperty('--font', t.font);
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--accent-contrast', accentContrast);
  root.style.setProperty('--accent-soft', accentSoft);
  root.style.setProperty('--bg', t.backdrop);
  root.style.setProperty('--page-bg', t.page);
  root.style.setProperty('--ink', ink);
  root.style.setProperty('--sub', rgba(ink, 0.62));
  root.style.setProperty('--line', rgba(ink, dark ? 0.22 : 0.16));
  root.style.setProperty('--cell-bg', cellBg);
  root.style.setProperty('--bar-bg', rgba(t.page, 0.92));
  root.style.setProperty('--weekend', t.weekend);
  root.style.setProperty('--weekend-soft', weekendSoft);
  root.style.setProperty('--radius', `${t.radius}px`);
  root.style.setProperty('--pattern-image', pat.css);
  root.style.setProperty('--pattern-size', pat.size);
  root.style.setProperty('--pattern-color', rgba(t.accent, 0.3));
  root.style.setProperty('--bg-image', t.bgImage ? `url("${t.bgImage}")` : 'none');

  document.body.classList.toggle('no-grid', !s.gridLines);
  document.body.classList.toggle('no-weekend', !s.weekendShade);
  document.body.classList.toggle('decor-off', !s.showDecor);
  $$('.stage-decor').forEach((el) => { el.textContent = t.decor; });
}

function applyLanguage() {
  const l = currentLang();
  document.documentElement.lang = l;
  document.title = t('appTitle');
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  const sel = $('#lang-select');
  if (sel) sel.value = l;
}

function saveSettings() {
  saveJSON(LS_SETTINGS, state.settings);
}

/* ---------- 事件辅助 ---------- */
function loadCats() {
  const custom = state.settings.customCats || [];
  return DEFAULT_CATS.concat(custom);
}

function catById(id) {
  const cats = loadCats();
  return cats.find((c) => c.id === id)
    || cats.find((c) => c.id === 'other')
    || { id: 'other', name: { 'zh-CN': '其他', 'zh-TW': '其他', en: 'Other' }, color: '#8b5cf6' };
}

function dayEvents(key) {
  return state.events
    .filter((e) => (!e.end || e.end < e.start ? key === e.start : (key >= e.start && key <= e.end)))
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.title.localeCompare(b.title));
}

function visibleEvents(key) {
  return dayEvents(key).filter((e) => !state.hiddenCats.has(e.category));
}

function chipColorStyle(color) {
  return `background:${color};color:${luminance(color) > 0.55 ? '#1b1b1b' : '#ffffff'}`;
}

function eventChipHTML(e) {
  const c = catById(e.category);
  const label = (e.time ? e.time + ' ' : '') + e.title;
  return `<button type="button" class="chip" style="${chipColorStyle(c.color)}" data-id="${esc(e.id)}" title="${esc(label)}">${esc(label)}</button>`;
}

/* ---------- 月历渲染 ---------- */
function renderWeekHeader() {
  const start = Number(state.settings.startWeek) || 1;
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const wd = (start + i) % 7;
    cells.push(`<div class="wk${wd === 0 || wd === 6 ? ' wk-end' : ''}">${weekFull(wd)}</div>`);
  }
  $('#week-header').innerHTML = cells.join('');
}

function renderCalendar() {
  const { y, m } = state.view;
  $('#month-label').textContent = t('monthLabelFmt', { y, m: m + 1, month: monthName(m) });

  renderWeekHeader();

  const start = Number(state.settings.startWeek) || 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const firstWd = new Date(y, m, 1).getDay();
  const offset = (firstWd - start + 7) % 7;
  const tk = todayKey();

  let html = '';
  for (let i = 0; i < 42; i++) {
    const day = i - offset + 1;
    let yy = y, mm = m, dd = day, outside = false;

    if (day < 1) {
      const p = new Date(y, m, 0);
      yy = p.getFullYear(); mm = p.getMonth(); dd = p.getDate() + day; outside = true;
    } else if (day > dim) {
      const n = new Date(y, m + 1, 1);
      yy = n.getFullYear(); mm = n.getMonth(); dd = day - dim; outside = true;
    }

    const key = dateKeyOf(yy, mm, dd);
    const wd = (start + i) % 7;
    const cls = ['cal-cell'];
    if (outside) cls.push('outside');
    if (key === tk) cls.push('is-today');
    if (wd === 0 || wd === 6) cls.push('is-weekend');

    const evs = visibleEvents(key);
    const chips = evs.slice(0, 3).map(eventChipHTML).join('');
    const more = evs.length > 3 ? `<button type="button" class="more" data-key="${key}">${esc(t('moreLabel', { n: evs.length - 3 }))}</button>` : '';

    html += `<div class="${cls.join(' ')}" data-key="${key}">
      <span class="cell-num">${dd}</span>
      <div class="cell-events">${chips}${more}</div>
    </div>`;
  }

  $('#cal-grid').innerHTML = html;
  renderMonthEvents();
}

function renderMonthEvents() {
  const { y, m } = state.view;
  const start = dateKeyOf(y, m, 1);
  const end = dateKeyOf(y, m + 1, 0);
  const list = state.events
    .filter((e) => e.start <= end && (e.end || e.start) >= start)
    .sort((a, b) => a.start.localeCompare(b.start) || (a.time || '').localeCompare(b.time || ''));
  const wrap = $('#month-events');
  $('#month-events-title').textContent = t('monthEventsTitleFmt', { y, m: m + 1, month: monthName(m), n: list.length });

  if (!list.length) {
    wrap.innerHTML = `<div class="empty-tip">${t('emptyMonth')}</div>`;
    return;
  }

  wrap.innerHTML = list.map((e) => {
    const c = catById(e.category);
    const range = e.end && e.end !== e.start ? `${e.start} → ${e.end}` : e.start;
    const meta = [range, e.time && e.time, catName(c)].filter(Boolean).join(' · ');
    return `<button type="button" class="ev-row" data-id="${esc(e.id)}">
      <span class="ev-dot" style="background:${c.color}"></span>
      <span class="ev-main">
        <span class="ev-title">${esc(e.title)}</span>
        <span class="ev-meta">${esc(meta)}</span>
      </span>
    </button>`;
  }).join('');
}

/* ---------- 分类图例 ---------- */
function renderCats() {
  const cats = loadCats();
  $('#cat-legend').innerHTML = cats.map((c) => {
    const off = state.hiddenCats.has(c.id);
    return `<div class="cat-item${off ? ' off' : ''}" data-id="${esc(c.id)}" title="${esc(t('catLegendTip'))}">
      <span class="cat-dot" style="background:${c.color}"></span>
      <span class="cat-name">${esc(catName(c))}</span>
      ${c.custom ? `<button type="button" class="cat-del" data-id="${esc(c.id)}" title="${esc(t('titleDeleteCat'))}">✕</button>` : ''}
    </div>`;
  }).join('');
}

function renderCatOptions() {
  $('#ev-cat').innerHTML = loadCats().map((c) =>
    `<option value="${esc(c.id)}">${esc(catName(c))}</option>`).join('');
}

/* ---------- 弹窗 ---------- */
function openModal(dateKeyStr, eventId) {
  const ev = eventId ? state.events.find((e) => e.id === eventId) : null;
  const key = ev ? ev.start : dateKeyStr;

  state.modal = { id: ev ? ev.id : null, date: key };
  renderCatOptions();

  $('#ev-id').value = ev ? ev.id : '';
  $('#ev-title').value = ev ? ev.title : '';
  $('#ev-start').value = key;
  $('#ev-end').value = ev && ev.end ? ev.end : '';
  $('#ev-time').value = ev && ev.time ? ev.time : '';
  $('#ev-cat').value = ev ? ev.category : 'other';
  $('#ev-note').value = ev && ev.note ? ev.note : '';
  $('#modal-title').textContent = t(ev ? 'modalEdit' : 'modalAdd');
  $('#btn-ev-delete').classList.toggle('hidden', !ev);

  updateDayList();
  $('#modal-overlay').classList.remove('hidden');
  setTimeout(() => $('#ev-title').focus(), 60);
}

function closeModal() {
  $('#modal-overlay').classList.add('hidden');
  state.modal = { id: null, date: null };
}

function updateDayList() {
  const key = $('#ev-start').value;
  const list = dayEvents(key);
  const el = $('#day-list');
  if (!key) { el.innerHTML = ''; return; }

  const parts = key.split('-').map(Number);
  $('#day-list-title').textContent = t('dayListTitleFmt', {
    y: parts[0], m: parts[1], d: parts[2], month: monthName(parts[1] - 1), n: list.length
  });

  if (!list.length) {
    el.innerHTML = `<div class="empty-tip">${t('emptyDay')}</div>`;
    return;
  }

  el.innerHTML = list.map((e) => {
    const c = catById(e.category);
    return `<button type="button" class="day-item" data-id="${esc(e.id)}">
      <span class="dot" style="background:${c.color}"></span>
      <span class="tt">${esc(e.title)}</span>
      <span class="tm">${e.time ? esc(e.time) : esc(t('fullDay'))}</span>
    </button>`;
  }).join('');
}

function saveEventFromForm() {
  const id = $('#ev-id').value;
  const title = $('#ev-title').value.trim();
  const start = $('#ev-start').value;
  const end = $('#ev-end').value;
  const time = $('#ev-time').value;
  const category = $('#ev-cat').value;
  const note = $('#ev-note').value.trim();

  if (!title) { toast(t('toastTitleRequired')); return; }
  if (!start) { toast(t('toastDateRequired')); return; }
  if (end && end < start) { toast(t('toastEndBeforeStart')); return; }

  const ev = { id: id || `ev-${Date.now()}`, title, start, end, time, category, note };

  if (id) {
    const idx = state.events.findIndex((e) => e.id === id);
    if (idx >= 0) state.events[idx] = ev;
  } else {
    state.events.push(ev);
  }

  saveJSON(LS_EVENTS, state.events);
  closeModal();
  renderCalendar();
  toast(t('toastSaved'));
}

function deleteCurrentEvent() {
  const id = $('#ev-id').value;
  if (!id) return;
  if (!confirm(t('confirmDeleteEvent'))) return;
  state.events = state.events.filter((e) => e.id !== id);
  saveJSON(LS_EVENTS, state.events);
  closeModal();
  renderCalendar();
  toast(t('toastDeleted'));
}

/* ---------- 数据导入导出 ---------- */
function exportData() {
  const payload = {
    app: 'printly-calendar',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    events: state.events
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${t('exportFileBase')}-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('toastExported'));
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.events)) throw new Error('bad format');
      state.events = data.events.map((e) => ({
        id: String(e.id || `ev-${Date.now()}-${Math.random()}`),
        title: String(e.title || t('unnamedEvent')),
        start: String(e.start || todayKey()),
        end: e.end ? String(e.end) : '',
        time: e.time ? String(e.time) : '',
        category: String(e.category || 'other'),
        note: e.note ? String(e.note) : ''
      }));
      if (data.settings) state.settings = mergeSettings(defaultSettings(), data.settings);
      saveJSON(LS_EVENTS, state.events);
      saveSettings();
      applySettings();
      refreshLanguage();
      toast(t('toastImported', { n: state.events.length }));
    } catch (err) {
      toast(t('toastImportFail'));
    }
  };
  reader.readAsText(file);
}

/* ---------- 打印页生成 ---------- */
function parseMonth(v) {
  const [y, m] = String(v || '').split('-').map(Number);
  if (!y || !m) return null;
  return { y, m: m - 1 };
}

function monthsInRange() {
  let start = parseMonth(state.settings.printStart);
  let end = parseMonth(state.settings.printEnd);
  if (!start || !end) {
    start = parseMonth(defaultSettings().printStart);
    end = parseMonth(defaultSettings().printEnd);
  }
  if (start.y * 12 + start.m > end.y * 12 + end.m) {
    const tmp = start; start = end; end = tmp;
    state.settings.printStart = `${start.y}-${pad2(start.m + 1)}`;
    state.settings.printEnd = `${end.y}-${pad2(end.m + 1)}`;
    saveSettings();
    syncPrintControls();
  }
  const out = [];
  const cursor = new Date(start.y, start.m, 1);
  const last = new Date(end.y, end.m, 1);
  let guard = 0;
  while (cursor <= last && guard < 240) {
    out.push({ y: cursor.getFullYear(), m: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
    guard++;
  }
  return out;
}

function holesHTML() {
  if (!state.settings.showHoles) return '';
  return `<span class="p-hole" style="left:62mm"></span><span class="p-hole" style="left:142mm"></span>`;
}

function decorHTML() {
  const t2 = effectiveTheme();
  if (!state.settings.showDecor) return '';
  const g = esc(t2.decor);
  return `<span class="p-decor tl">${g}</span><span class="p-decor tr">${g}</span><span class="p-decor bl">${g}</span><span class="p-decor br">${g}</span>`;
}

function guideHTML() {
  return `<div class="p-guide"><span>${esc(t('bindingGuide'))}</span></div>`;
}

function coverKicker(first, last) {
  if (currentLang() === 'en') {
    return `${MONTHS_EN[first.m]} ${first.y} — ${MONTHS_EN[last.m]} ${last.y}`;
  }
  return `${first.y}.${pad2(first.m + 1)} — ${last.y}.${pad2(last.m + 1)}`;
}

function monthPageHTML(month, pageNum, total) {
  const { y, m } = month;
  const start = Number(state.settings.startWeek) || 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const offset = (new Date(y, m, 1).getDay() - start + 7) % 7;
  const tk = todayKey();

  const week = Array.from({ length: 7 }, (_, i) => {
    const wd = (start + i) % 7;
    return `<div class="p-wk${wd === 0 || wd === 6 ? ' wk-end' : ''}">${weekShort(wd)}</div>`;
  }).join('');

  let cells = '';
  for (let i = 0; i < 42; i++) {
    const day = i - offset + 1;
    let yy = y, mm = m, dd = day, outside = false;

    if (day < 1) {
      const p = new Date(y, m, 0);
      yy = p.getFullYear(); mm = p.getMonth(); dd = p.getDate() + day; outside = true;
    } else if (day > dim) {
      const n = new Date(y, m + 1, 1);
      yy = n.getFullYear(); mm = n.getMonth(); dd = day - dim; outside = true;
    }

    const key = dateKeyOf(yy, mm, dd);
    const wd = (start + i) % 7;
    const cls = ['p-cell'];
    if (outside) cls.push('outside');
    if (key === tk) cls.push('is-today');
    if (wd === 0 || wd === 6) cls.push('is-weekend');

    const evs = dayEvents(key);
    const chips = evs.slice(0, 4).map((e) => {
      const c = catById(e.category);
      const label = (e.time ? e.time + ' ' : '') + e.title;
      return `<span class="p-chip" style="${chipColorStyle(c.color)}">${esc(label)}</span>`;
    }).join('');
    const more = evs.length > 4 ? `<span class="p-more">${esc(t('moreLabel', { n: evs.length - 4 }))}</span>` : '';

    cells += `<div class="${cls.join(' ')}">
      <span class="p-num">${dd}</span>
      <div class="p-events">${chips}${more}</div>
    </div>`;
  }

  const notes = state.settings.showNotes ? `<div class="p-notes">${esc(t('notes'))}</div>` : '';

  return `<section class="print-page">
    <div class="p-bg"></div>
    ${guideHTML()}
    ${holesHTML()}
    ${decorHTML()}
    <header class="p-head">
      <p class="p-year">${esc(t('pYearFmt', { y, month: monthName(m) }))}</p>
      <h2 class="p-title">${esc(t('pTitleNum', { m: m + 1, month: monthName(m) }))}</h2>
      <p class="p-sub">${esc(t('pSubFmt', { monthEn: MONTHS_EN[m], month: monthName(m), y }))}</p>
    </header>
    <div class="p-week">${week}</div>
    <div class="p-grid">${cells}</div>
    <footer class="p-footer">${notes}<div class="p-page">${pageNum} / ${total}</div></footer>
  </section>`;
}

function coverPageHTML(months) {
  const first = months[0], last = months[months.length - 1];
  const chips = Array.from({ length: 12 }, (_, i) => {
    const inRange = months.some((mo) => mo.m === i);
    return `<span class="cover-month${inRange ? ' in-range' : ''}">${esc(t('coverMonthFmt', { m: i + 1, monthShort: MONTHS_EN[i] }))}</span>`;
  }).join('');

  return `<section class="print-page cover-page">
    <div class="p-bg"></div>
    ${guideHTML()}
    ${holesHTML()}
    ${decorHTML()}
    <div class="cover-content">
      <p class="cover-kicker">${esc(coverKicker(first, last))}</p>
      <h1 class="cover-title">${esc(state.settings.coverTitle || t('brandName'))}</h1>
      <div class="cover-line"></div>
      <p class="cover-sub">${esc(t('coverSub'))}</p>
      <div class="cover-months">${chips}</div>
    </div>
  </section>`;
}

function buildPrintPages() {
  const months = monthsInRange();
  const pages = [];
  if (state.settings.includeCover) pages.push(coverPageHTML(months));
  const total = months.length + (state.settings.includeCover ? 1 : 0);
  months.forEach((mo, i) => {
    pages.push(monthPageHTML(mo, i + 1 + (state.settings.includeCover ? 1 : 0), total));
  });

  $('#print-root').innerHTML = `
    <div class="preview-bar">
      <div><strong>${esc(t('previewBar', { n: pages.length, m: months.length }))}</strong></div>
      <div>
        <button type="button" id="pb-print" class="btn primary mini">${esc(t('btnPrintPreview'))}</button>
        <button type="button" id="pb-close" class="btn ghost mini">${esc(t('btnClose'))}</button>
      </div>
    </div>
    <div class="pages-wrap">${pages.join('')}</div>`;

  $('#pb-print').addEventListener('click', () => window.print());
  $('#pb-close').addEventListener('click', closePreview);
}

function openPreview() {
  buildPrintPages();
  document.body.classList.add('preview-open');
}

function closePreview() {
  document.body.classList.remove('preview-open');
}

/* ---------- 控件同步 ---------- */
function syncControlsFromSettings() {
  const s = state.settings;
  const th = effectiveTheme();
  $('#accent-color').value = th.accent;
  $('#bg-color').value = th.page;
  $('#pattern-select').value = th.pattern;
  $('#font-select').value = th.font;
  $('#radius-range').value = th.radius;
  $('#radius-val').textContent = `${th.radius}px`;
  $('#start-week').value = String(s.startWeek);
  $('#chk-holes').checked = !!s.showHoles;
  $('#chk-decor').checked = !!s.showDecor;
  $('#chk-grid').checked = !!s.gridLines;
  $('#chk-weekend').checked = !!s.weekendShade;
  $('#chk-cover').checked = !!s.includeCover;
  $('#cover-title').value = s.coverTitle || '';
  $('#chk-notes').checked = !!s.showNotes;
  $('#bg-tip').textContent = s.custom && s.custom.bgImage ? t('bgTipUsed') : t('bgTipDefault');
  syncPrintControls();
}

function syncPrintControls() {
  $('#print-start').value = state.settings.printStart;
  $('#print-end').value = state.settings.printEnd;
}

function renderThemeGrid() {
  const wrap = $('#theme-grid');
  wrap.innerHTML = Object.entries(THEMES).map(([id]) => `
    <button type="button" class="theme-card${state.settings.themeId === id ? ' active' : ''}" data-theme="${id}">
      <span class="theme-swatch" style="background:${THEMES[id].swatch}"></span>
      <span class="theme-name">${esc(themeName(id))}</span>
      <span class="theme-desc">${esc(themeDesc(id))}</span>
    </button>`).join('');

  $$('.theme-card', wrap).forEach((btn) => {
    btn.addEventListener('click', () => selectTheme(btn.dataset.theme));
  });
}

function selectTheme(id) {
  const th = THEMES[id];
  if (!th) return;
  state.settings.themeId = id;
  state.settings.custom = {
    accent: th.accent,
    page: th.page,
    pattern: th.pattern,
    font: th.font,
    radius: th.radius,
    bgImage: ''
  };
  saveSettings();
  applySettings();
  syncControlsFromSettings();
  renderThemeGrid();
  toast(t('toastThemeApplied', { name: themeName(id) }));
}

function fillSelects() {
  const patternSel = $('#pattern-select');
  patternSel.innerHTML = PATTERNS.map((p) => `<option value="${p.id}">${esc(patternName(p))}</option>`).join('');

  const fontSel = $('#font-select');
  fontSel.innerHTML = FONTS.map((f) => `<option value="${esc(f.css)}">${esc(fontName(f))}</option>`).join('');
}

function refreshLanguage() {
  fillSelects();
  applyLanguage();
  syncControlsFromSettings();
  renderThemeGrid();
  renderCats();
  renderCalendar();
  if (!$('#modal-overlay').classList.contains('hidden')) updateDayList();
  if (document.body.classList.contains('preview-open')) buildPrintPages();
}

/* ---------- 提示 ---------- */
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  /* 语言切换 */
  $('#lang-select').addEventListener('change', (e) => {
    const oldLang = currentLang();
    if (state.settings.coverTitle === I18N[oldLang].brandName) {
      state.settings.coverTitle = I18N[e.target.value].brandName;
    }
    state.settings.lang = e.target.value;
    saveSettings();
    refreshLanguage();
  });

  /* 月份导航 */
  $('#btn-prev').addEventListener('click', () => {
    state.view.m--;
    if (state.view.m < 0) { state.view.m = 11; state.view.y--; }
    renderCalendar();
  });
  $('#btn-next').addEventListener('click', () => {
    state.view.m++;
    if (state.view.m > 11) { state.view.m = 0; state.view.y++; }
    renderCalendar();
  });
  $('#btn-today').addEventListener('click', () => {
    state.view = { y: new Date().getFullYear(), m: new Date().getMonth() };
    renderCalendar();
  });

  /* 侧栏标签 */
  $$('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach((b) => b.classList.toggle('active', b === btn));
      $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${btn.dataset.tab}`));
    });
  });

  /* 日历格子 */
  $('#cal-grid').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip && chip.dataset.id) { openModal(null, chip.dataset.id); return; }

    const more = e.target.closest('.more');
    if (more && more.dataset.key) { openModal(more.dataset.key); return; }

    const cell = e.target.closest('.cal-cell');
    if (cell && cell.dataset.key) openModal(cell.dataset.key);
  });

  /* 侧栏日程列表 */
  $('#month-events').addEventListener('click', (e) => {
    const row = e.target.closest('.ev-row');
    if (row && row.dataset.id) openModal(null, row.dataset.id);
  });

  /* 分类图例 */
  $('#cat-legend').addEventListener('click', (e) => {
    const del = e.target.closest('.cat-del');
    if (del) {
      const id = del.dataset.id;
      if (!confirm(t('confirmDeleteCat'))) return;
      state.settings.customCats = (state.settings.customCats || []).filter((c) => c.id !== id);
      state.events = state.events.map((ev) => ev.category === id ? { ...ev, category: 'other' } : ev);
      saveJSON(LS_EVENTS, state.events);
      saveSettings();
      renderCats();
      renderCalendar();
      return;
    }
    const item = e.target.closest('.cat-item');
    if (!item) return;
    const id = item.dataset.id;
    if (state.hiddenCats.has(id)) state.hiddenCats.delete(id);
    else state.hiddenCats.add(id);
    renderCats();
    renderCalendar();
  });

  $('#btn-add-cat').addEventListener('click', () => {
    const name = $('#new-cat-name').value.trim();
    const color = $('#new-cat-color').value;
    if (!name) { toast(t('toastCatName')); return; }
    state.settings.customCats = state.settings.customCats || [];
    state.settings.customCats.push({ id: `cat-${Date.now()}`, name, color, custom: true });
    $('#new-cat-name').value = '';
    saveSettings();
    renderCats();
    toast(t('toastCatAdded', { name }));
  });

  /* 弹窗 */
  $('#btn-modal-close').addEventListener('click', closeModal);
  $('#btn-ev-cancel').addEventListener('click', closeModal);
  $('#btn-ev-delete').addEventListener('click', deleteCurrentEvent);
  $('#event-form').addEventListener('submit', (e) => { e.preventDefault(); saveEventFromForm(); });
  $('#ev-start').addEventListener('change', updateDayList);
  $('#day-list').addEventListener('click', (e) => {
    const item = e.target.closest('.day-item');
    if (item && item.dataset.id) {
      const ev = state.events.find((x) => x.id === item.dataset.id);
      if (ev) openModal(ev.start, ev.id);
    }
  });

  /* 数据 */
  $('#btn-export').addEventListener('click', exportData);
  $('#file-import').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });
  $('#btn-clear').addEventListener('click', () => {
    if (!confirm(t('confirmClear'))) return;
    state.events = [];
    saveJSON(LS_EVENTS, state.events);
    renderCalendar();
    toast(t('toastCleared'));
  });

  /* 设计 */
  $('#accent-color').addEventListener('input', (e) => {
    state.settings.custom.accent = e.target.value;
    applySettings(); saveSettings();
  });
  $('#bg-color').addEventListener('input', (e) => {
    state.settings.custom.page = e.target.value;
    applySettings(); saveSettings();
  });
  $('#pattern-select').addEventListener('change', (e) => {
    state.settings.custom.pattern = e.target.value;
    applySettings(); saveSettings();
  });
  $('#font-select').addEventListener('change', (e) => {
    state.settings.custom.font = e.target.value;
    applySettings(); saveSettings();
  });
  $('#radius-range').addEventListener('input', (e) => {
    state.settings.custom.radius = Number(e.target.value);
    $('#radius-val').textContent = `${e.target.value}px`;
    applySettings(); saveSettings();
  });
  $('#bg-file').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.settings.custom.bgImage = String(reader.result);
      saveSettings();
      applySettings();
      syncControlsFromSettings();
      toast(t('toastBgApplied'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  $('#bg-remove').addEventListener('click', () => {
    state.settings.custom.bgImage = '';
    saveSettings();
    applySettings();
    syncControlsFromSettings();
    toast(t('toastBgRemoved'));
  });

  const boolCheck = (id, key) => {
    $(id).addEventListener('change', (e) => {
      state.settings[key] = e.target.checked;
      applySettings();
      saveSettings();
    });
  };
  boolCheck('#chk-holes', 'showHoles');
  boolCheck('#chk-decor', 'showDecor');
  boolCheck('#chk-grid', 'gridLines');
  boolCheck('#chk-weekend', 'weekendShade');
  boolCheck('#chk-cover', 'includeCover');
  boolCheck('#chk-notes', 'showNotes');

  $('#start-week').addEventListener('change', (e) => {
    state.settings.startWeek = Number(e.target.value);
    saveSettings();
    renderCalendar();
  });

  /* 打印 */
  $('#print-start').addEventListener('change', (e) => {
    state.settings.printStart = e.target.value || state.settings.printStart;
    saveSettings();
  });
  $('#print-end').addEventListener('change', (e) => {
    state.settings.printEnd = e.target.value || state.settings.printEnd;
    saveSettings();
  });
  $('#btn-range-year').addEventListener('click', () => {
    const y = new Date().getFullYear();
    state.settings.printStart = `${y}-01`;
    state.settings.printEnd = `${y}-12`;
    saveSettings();
    syncPrintControls();
    toast(t('toastRangeYear', { y }));
  });
  $('#btn-range-next12').addEventListener('click', () => {
    const start = new Date();
    const end = new Date(start.getFullYear(), start.getMonth() + 11, 1);
    state.settings.printStart = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}`;
    state.settings.printEnd = `${end.getFullYear()}-${pad2(end.getMonth() + 1)}`;
    saveSettings();
    syncPrintControls();
    toast(t('toastRangeNext12'));
  });
  $('#cover-title').addEventListener('change', (e) => {
    state.settings.coverTitle = e.target.value;
    saveSettings();
  });

  $('#btn-build-preview').addEventListener('click', openPreview);
  $('#btn-print-side').addEventListener('click', () => { buildPrintPages(); window.print(); });

  /* 顶部按钮 */
  $('#btn-preview').addEventListener('click', openPreview);
  $('#btn-print').addEventListener('click', () => { buildPrintPages(); window.print(); });

  /* 快捷键 */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#modal-overlay').classList.contains('hidden')) closeModal();
    else if (document.body.classList.contains('preview-open')) closePreview();
  });

  window.addEventListener('beforeprint', buildPrintPages);
}

/* ---------- 启动 ---------- */
function init() {
  fillSelects();
  applyLanguage();
  applySettings();
  syncControlsFromSettings();
  renderThemeGrid();
  renderCats();
  renderCalendar();
  bindEvents();
  if (state.events.length === 0) renderMonthEvents();
}

init();
