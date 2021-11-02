// 根部state属性
interface RootState {
    /**
     * 头部商品分类导航数据
     */
    commodityTypesDatas: Array<CommodityTypes>,
    /**
     * 头部轮播图数据
     */
    carouselDatas: Array<Carousel>,
    /**
     * 手机模块的商品数据
     */
    phoneDatas: Phone,
    /**
     * 家电模块的商品数据
     */
    homeAppliances: Phone,
}

// login模块的state
interface UserState {
    isLogin: boolean; // 用户是否已经登录
    userName: string; // 用户的昵称
    avatarSrc: string; // 用户的头像
    name: string; // 用户的真实姓名,
    telephone: string; // 用户的手机号码,
    address: string; // 用户地址
    account: string; // 用户账号
}

// vuex各个state属性的集成
interface AllState extends RootState {
    UserModule: UserState;
}

export { RootState, UserState, AllState }