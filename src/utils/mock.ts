export const mockPhoto = {
  _id: '68775b9153e7f5b848bc91fe',
  imageUrl: 'https://snowinlu.oss-cn-beijing.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20241217103322.jpg',
  focalLength: '35',
  aperture: '1.4',
  ISO: '2500',
  shootingTimeAt: '2024-07-01',
  title: '啤酒屋',
  camera: { _id: '68775b9153e7f5b848bc91ce', fullName: 'X-T5' },
  location: { _id: '68775b9153e7f5b848bc91be', fullName: '长沙·岳麓区·迷宫Mazes' },
  createdTime: '2025-08-05T06:07:54.500Z'
}

export const mockYear = {
  _id: '2025',
  title: '2025',
  total: 68,
  cover: 'https://snowinlu.oss-cn-beijing.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20241217103322.jpg'
}

export const mockCamera = {
  _id: '68775b9153e7f5b848bc91fe',
  title: 'X-T5',
  total: 68,
  cover: 'https://snowinlu.oss-cn-beijing.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20241217103322.jpg'
}

export const mockFilterList = [
  {
    type: 'YEAR',
    list: [
      { label: '2025', value: '2025' },
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' }
    ]
  },
  {
    type: 'CAMERA',
    list: [
      { label: 'NIKON Z30', value: '68775b9153e7f5b848bc91fe' },
      { label: 'FUJIFILM X-T4', value: '68775b9153e7f5b848bc91fe' },
      { label: 'IPHONE SE3', value: '68775b9153e7f5b848bc91fe' }
    ]
  },
  {
    type: 'LENS',
    list: [
      { label: 'XF35MM1.4 R', value: '68775b9153e7f5b848bc91fe' },
      { label: 'XF16-55MM2.8 R LM WR', value: '68775b9153e7f5b848bc91fe' },
      { label: 'XF16-80MM2.8 R LM WR', value: '68775b9153e7f5b848bc91fe' },
      { label: 'XF18-55MM2.8 R LM WR', value: '68775b9153e7f5b848bc91fe' }
    ]
  },
  {
    type: 'ALBUM',
    list: [
      { label: '沐沐1岁照', value: '68775b9153e7f5b848bc91fe' },
      { label: '精酿酒记', value: '68775b9153e7f5b848bc91fe' }
    ]
  },
  {
    type: 'LOCATION',
    list: [
      { label: '长沙', value: '68775b9153e7f5b848bc91fe' },
      { label: '张坊', value: '68775b9153e7f5b848bc91fe' },
      { label: '浏阳', value: '68775b9153e7f5b848bc91fe' },
      { label: '平江', value: '68775b9153e7f5b848bc91fe' }
    ]
  }
]
