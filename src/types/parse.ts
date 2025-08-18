// 相片元数据类型定义
export interface PhotoMetadata {
  /** 品牌名称 */
  brandName?: string
  /** 相机名称 */
  cameraName?: string
  /** 镜头名称 */
  lensesName?: string
  /** 拍摄时间 */
  shootingTimeAt?: string
  /** ISO 感光度 */
  ISO?: string
  /** 焦距 */
  focalLength?: string
  /** 快门速度 */
  shutter?: string
  /** 光圈值 */
  aperture?: string
}
