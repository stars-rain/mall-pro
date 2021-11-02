/* eslint-disable prefer-const */
/**
 * 将Base64格式的图片转化为Blob格式的图片
 * @param base64Data - base6格式的图片
 * @returns 处理后的Blob格式的图片
 */
const dataURItoBlob: (base64Data: string) => Blob
  = (base64Data: string): Blob => {
    let byteString: string = base64Data;
    if (base64Data.split(",")[0].indexOf("base64") >= 0) {
        byteString = atob(base64Data.split(",")[1]); // 解码使用 base-64 编码的字符串。
    } else {
        byteString = unescape(base64Data.split(",")[1]);
    }
    // 获取文件类型
    const mimeString: string = (
        base64Data.split(",")[0].match(/:(.*?);/) as Array<string>
    )[1]; // mime类型

    // eslint-disable-next-line prefer-const
    let uintArr: Uint8Array = new Uint8Array(byteString.length); // 创建视图

    for (let i = 0; i < byteString.length; i++) {
        uintArr[i] = byteString.charCodeAt(i);
    }
    // 生成blob图片
    const blob: Blob = new Blob([uintArr], {
        type: mimeString,
    });
    return blob;
}

/**
 * 对图片进行压缩
 * @param Base64Data - 被压缩的图片
 * @param compressed - 压缩的规格
 */
const pictureCompression: (
    Base64Data: string,
    compressed?: {
      quality: number,
      wid?: number,
      hei?: number,
     },
    ) => Promise<Blob>
  = (
      Base64Data: string,
      compressed: {
        quality: number,
        wid?: number,
        hei?: number,
     }  = { quality: 0.5 },
      ): Promise<Blob> => {
  return new Promise<Blob>(resolve => {
    const img: HTMLImageElement = new Image();
    img.src = Base64Data;
    img.onload = (): void => {
      /**
       * 图片的压缩后的质量(大于0且小于1)
       */
      let quality: number = compressed.quality >= 1 && compressed.quality <= 0 ? 0.5 : compressed.quality;
      /**
       * 图片的宽度
       */
      let wid: number = compressed.wid as number ?? img.width;
      /**
       * 图片的高度
       */
      let hei: number = compressed.hei as number ?? img.height;
      /**
       * 图片的宽高比
       */
       let canvas: HTMLCanvasElement = document.createElement('canvas');
       let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
       canvas.width = wid;
       canvas.height = hei;
       ctx?.drawImage(img, 0, 0, wid, hei);
       resolve(dataURItoBlob(canvas.toDataURL('image/jpeg', quality)));
    }
  })
}

export { dataURItoBlob, pictureCompression }