let AC_TEST = []
const T = (text) => {
  AC_TEST.push({
    text: text,
    dbId: `ac_paper.${AC_TEST.length}`,
    name: `题目${AC_TEST.length+1}`
  })
}

AC_TEST.BACKGROUND = `学术水平测试背景`

T('学测题目1')
T('学测题目2')

export default AC_TEST