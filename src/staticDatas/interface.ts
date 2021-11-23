/**
 * 点击用户头像出现的操作菜单属性接口
 */
interface UserOpearMenu {
    id: number;
    message: string;
    iconClass: string;
}

interface Emotion {
    id: number;
    emotion: string;
}

export { UserOpearMenu, Emotion }