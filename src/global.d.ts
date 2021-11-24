declare let require: NodeRequire;
/**
 * 商品属性接口
 * @interface
 */
interface Commodity {
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
    products: Array<Commodity>; // 头部商品分类导航的标题属性的子数据
}

/**
 * 轮播图数据接口
 * @interface
 */
declare type Carousel = {
    id: number;
    productId: number;
    imgSrc: string;
}

/**
 * 手机类型数据声明
 */
type Product1 = Pick<Commodity, 'id' | 'titleId' | 'imgSrc'> & { productId: number };

/**
 * 首页商品数据接口
 */
declare type Phone = {
    product1: Product1;
    product2: Product1;
    products: Array<Commodity>;
}

/**
 * 用户属性接口
 */
declare type User = {
    userName: string;
    account: string;
    password: string;
    repeatPassword: string;
}

/**
 * 商品详情的数据接口
 */
declare type CommodityDetails = Commodity &
{ saleDesc: string;imgDetails: Array<{ id: number;src: string; }> };

/**
 * 购物车中某件商品的接口
 */
declare type CartItem = {
    id: number;
    productId: number; // 商品的id值(唯一)
    title: string; // 商品所属类型
    name: string; // 商品名称
    imgSrc: string; // 商品图片路径
    price: number; // 商品单价
    count: number; // 商品数量
    cost: number; // 商品总价
    account?: string;
}

/**
 * 评论内容接口
 */
declare type Comments = {
    type: number, // 确定是评论还是回复评论(0代表评论)
    time: number; // 评论发表的时间戳
    comment: string; // 评论内容
    avatar: string; // 头像路径
    userName: string; // 评论人的昵称
    showReplay?: boolean; // 是否显示回复评论的内容
    replaiedName?: string; // 被回复人的姓名
    replay: Array<Omit<Comments, 'showReplay'> & { replaiedName: string }>; // 回复的数据
}