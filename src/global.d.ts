declare let require: NodeRequire;
/**
 * 商品属性接口
 * @interface
 */
declare interface Commodity {
    id: number; // 商品编号
    titleId: number; // 商品类型值id (后端根据此id值判断该商品类别)
    imgSrc: string; // 商品图片路径
    name: string; // 商品名称
    curPrice: string; // 商品当前价格
    oriPrice: string; // 商品原价
    description: string; // 商品描述
}
/**
 * 头部商品分类导航类型接口
 * @interface
 */
declare type CommodityTypes = {
    id: number;
    title: string; // 头部商品分类导航的标题 (如： 手机、电视等)
    products: Array<commodity>; // 头部商品分类导航的标题属性的子数据
}

/**
 * 轮播图数据接口
 * @interface
 */
declare type Carousel = {
    id: number;
    url: string;
    imgSrc: string;
}