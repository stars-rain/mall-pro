import type { UserOpearMenu } from "./interface"

const userOperaMenu: Array<UserOpearMenu> = [
    {
        id: 1,
        message: '上传头像',
        iconClass: 'uploadAvatar',
    },
    {
        id: 2,
        message: '修改用户名',
        iconClass: 'userEdit',
    },
    {
        id: 3,
        message: '修改密码',
        iconClass: 'lock'
    },
    {
        id: 4,
        message: '设置收货信息',
        iconClass: 'location',
    },
    {
        id: 5,
        message: '退出登录',
        iconClass: 'signOut',
    },
]

export { userOperaMenu }