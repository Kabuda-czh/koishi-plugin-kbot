/* eslint-disable no-mixed-operators */
/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 11:18:49
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-22 16:40:08
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\static\bilibiliStyle.js
 * @Description: 用于初始化手机动态页面的样式以及图片大小
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
async function getBilibiliStyle() {
  // 删除 dom 的对象, 可以自行添加 ( className 需要增加 '.' 为前缀, id 需要增加 '#' 为前缀)
  const deleteDoms = {
    // 关注 dom
    followDoms: [
      '.dyn-header__following',
      '.easy-follow-btn',
      '.dyn-orig-author__right',
    ],
    // 分享 dom
    shareDoms: ['.dyn-share'],
    // 打开程序 dom
    openAppBtnDoms: ['.dynamic-float-btn', '.float-openapp'],
    // 导航 dom
    navDoms: ['.m-navbar', '.opus-nav'],
    // 获取更多 dom
    readMoreDoms: ['.opus-read-more'],
    // 全屏弹出 Dom
    openAppDialogDoms: ['.openapp-dialog'],
    // 评论区 dom
    commentsDoms: ['.v-switcher', '.bili-dyn-item__panel'],
    // PC端登陆 dom
    pcLoginDoms: ['.login-tip'],
  }

  // 遍历对象的值, 并将多数组扁平化, 再遍历进行删除操作
  Object.values(deleteDoms)
    .flat(1)
    .forEach((domTag) => {
      const deleteDom = document.querySelector(domTag)
      deleteDom && deleteDom.remove()
    })

  // 新版动态需要移除对应 class 达到跳过点击事件, 解除隐藏的目的
  const contentDom = document.querySelector('.opus-module-content')
  contentDom && contentDom.classList.remove('limit')

  // 设置 mopus 的 paddingTop 为 0
  const mOpusDom = document.querySelector('.m-opus')
  if (mOpusDom) {
    mOpusDom.style.paddingTop = '0'
    mOpusDom.style.minHeight = '0'
  }

  // 需要禁用的字体 dom 对象
  const fontUnsetDomObject = {
    // 电脑端动态字体 dom
    dynPcDoms: ['.bili-dyn-content', '.bili-dyn-item'],
    // 手机端动态字体 dom
    dynMobileDoms: ['.dyn-card'],
  }

  Object.values(fontUnsetDomObject)
    .flat(1)
    .forEach((domTag) => {
      const unsetDom = document.querySelector(domTag)
      unsetDom && (unsetDom.style.fontFamily = 'unset')
    })

  // 获取图片容器的所有 dom 数组
  const imageItemDoms = Array.from(
    document.querySelectorAll('.bm-pics-block__item'),
  )

  // 获取图片长宽比例
  const getImageRatio = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = () => {
        resolve(img.width / img.height)
      }
      img.onerror = (err) => {
        reject(err)
      }
    })
  }

  // 图片长宽比例的数组
  const ratioList = []

  // 异步遍历图片 dom
  await Promise.all(
    imageItemDoms.map(async (item) => {
      // 获取原app中图片的src
      const imgSrc = item.firstChild.src
      // 判断是否有 @ 符
      const imgSrcAtIndex = imgSrc.indexOf('@')
      // 将所有图片转换为 .webp 格式节省加载速度, 并返回给原来的 image 标签
      item.firstChild.src
        = imgSrcAtIndex !== -1
          ? `${imgSrc.slice(0, imgSrcAtIndex + 1)}.webp`
          : imgSrc
      // 获取图片的宽高比
      ratioList.push(await getImageRatio(item.firstChild.src))
    }),
  ).then(() => {
    // 获取图片比例数组中接近 1 的数量 isAllOneLength
    const isAllOneLength = ratioList.filter(item => item >= 0.9 && item <= 1.1).length
    // 判断图片是否为 9 图: 是则判断 isAllOneLength 是否超过图片比例数组半数, 不是则判断是否为 3 的倍数
    const isAllOne
      = ratioList.length === 9
        ? isAllOneLength > ratioList.length / 2
        : isAllOneLength > 0
          && isAllOneLength % 3 === 0
          && ratioList.length > 3

    // 说明可能为组装的拼图, 如果不是则放大为大图
    if (!isAllOne) {
      // 找到图标容器dom
      const containerDom = document.querySelector('.bm-pics-block__container')
      if (containerDom) {
        // 先把默认 padding-left 置为0
        containerDom.style.paddingLeft = '0'
        // 先把默认 padding-right 置为0
        containerDom.style.paddingRight = '0'
        // 设置 flex 模式下以列形式排列
        containerDom.style.flexDirection = 'column'
        // 设置 flex 模式下每个容器间隔15px
        containerDom.style.gap = '15px'
        // flex - 垂直居中
        containerDom.style.justifyContent = 'center'
        // flex - 水平居中
        containerDom.style.alignItems = 'center'
      }

      // 新版动态需要给 bm-pics-block 的父级元素设置 flex 以及 column
      const newContainerDom
        = document.querySelector('.bm-pics-block')?.parentElement
      if (newContainerDom) {
        // 设置为 flex
        newContainerDom.style.display = 'flex'
        // 设置为竖向排列
        newContainerDom.style.flexDirection = 'column'
        // flex - 垂直居中
        newContainerDom.style.justifyContent = 'center'
        // flex - 水平居中
        newContainerDom.style.alignItems = 'center'
      }

      imageItemDoms.forEach((item) => {
        // 获取屏幕比例的 90% 宽度
        const clientWidth = window.innerWidth * 0.9
        // 先把默认 margin 置为 0
        item.style.margin = '0'
        // 宽度默认撑满屏幕宽度 90%;
        item.style.width = `${clientWidth}px`
        // 设置自动高度
        item.style.height = 'auto'
      })
    }
  })
}

async function setFont(needLoadFontList) {
  const emojiFontList = [
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ]

  // 字体按需加载方法
  await (async () => {
    const code = needLoadFontList.reduce((defaultString, fontObject) => {
      return (
        `${defaultString
        }@font-face { font-family: ${fontObject.fontFamily};src: url('${fontObject.fontUrl}'); }`
      )
    }, '')
    const style = document.createElement('style')
    style.rel = 'stylesheet'
    style.appendChild(document.createTextNode(code))
    const head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
  })()

  // 将字体样式设置到 div#app 上
  const appDom = document.querySelector('#app')
  const emojiFont = emojiFontList.join(',')

  if (appDom) {
    // 动态加字体, 并给与默认值 sans-serif
    const needLoadFont = needLoadFontList.reduce(
      (defaultString, fontObject) => `${defaultString + fontObject.fontFamily},`,
      '',
    )

    appDom.style.fontFamily = `${needLoadFont + emojiFont},sans-serif`

    appDom.style.overflowWrap = 'break-word'
  }
}

async function imageComplete() {
  // 异步渲染已经加载的图片地址, 如果已经缓存则会立即返回 true
  const loadImageAsync = (url) => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = url

      image.onload = () => {
        resolve(image.complete) // 理应为 true
      }

      image.onerror = () => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(false)
      }
    })
  }

  // 获取图片容器的所有 dom
  const imageItemDoms = document.querySelectorAll('.bm-pics-block__item')

  // 异步遍历图片并等待
  const imageItemStatusArray = await Promise.all(
    Array.from(imageItemDoms).map((item) => {
      return loadImageAsync(item.firstChild.src)
    }),
  )

  // 通过遍历图片加载状态, 如果有一个图片加载失败, 均为 false
  return imageItemStatusArray.reduce((p, c) => {
    return p && c
  }, true)
}

function fontsLoaded() {
  // 判断字体是否都加载完成
  return document.fonts.status === 'loaded'
}

window.onload = () => {
  getBilibiliStyle()
}

getBilibiliStyle()
