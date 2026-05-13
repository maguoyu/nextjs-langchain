# 仪表板雷达图规格

## ADDED Requirements

### Requirement: 雷达图组件

雷达图组件用于展示系统在多个维度上的综合表现。

#### Scenario: 雷达图显示系统能力指标

- **WHEN** 用户访问 `/dashboard` 页面
- **THEN** 雷达图展示以下维度的指标：
  - API 响应时间 (ms)
  - 并发处理能力 (req/s)
  - 系统可用性 (%)
  - 数据完整率 (%)
  - 错误率控制 (%)
  - 安全性评分

#### Scenario: 雷达图响应式布局

- **WHEN** 雷达图在移动端显示
- **THEN** 图表宽度自适应容器
- **AND** 图例文字适当缩小

### Requirement: 雷达图数据 API

#### Scenario: API 返回雷达图数据

- **WHEN** 前端请求 `/api/dashboard/stats`
- **THEN** 返回 `radarData` 字段，包含指标名称和数值
- **AND** 数值范围为 0-100（归一化处理）
