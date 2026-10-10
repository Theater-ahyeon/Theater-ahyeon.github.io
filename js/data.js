export const profile = {
 name:'theater',
 tagline:'视觉与交互实验',
 siteType:'个人博客与作品集',
 github:'https://github.com/Theater-ahyeon',
 metaSummary:'个人博客首页，记录视觉、动效与交互的持续实验。',
 intro:['画面的秩序，运动的节奏。','在这里，记录视觉与交互的探索。'],
 summary:['这个主页收录界面设计、动态视觉与前端重构的探索。','作品与观测，在同一份档案中持续展开。']
};
export const chapters = {
 home: {label:'序章', en:'INTRODUCTION', title:`${profile.name} · ${profile.tagline}`},
 works: {label:'作品', en:'SELECTED WORKS', title:`作品 · ${profile.name}`},
 studies: {label:'观测', en:'VISUAL STUDIES', title:`观测 · ${profile.name}`},
 about: {label:'关于', en:'PROFILE', title:`关于 · ${profile.name}`}
};
export const projects = [
 {id:'showreel', reference:{label:'Kakavlinna · 原始视频',url:'https://www.bilibili.com/video/BV1Pxa269EJC/'}, no:'01', category:'FRONT-END RECONSTRUCTION', title:'SHOWREEL', subtitle:'交互重构', status:'私有项目 · 过程展示', description:'将动态影像中的版式、镜头与视觉层次，拆解为可以操作的网页组件。', tags:['视觉拆解','组件重构','交互动效'], image:'./assets/showreel-study.svg', imageAlt:'原创几何封面：分镜窗口、轨迹与模块化版式，非项目截图', detail:'以原始影像为参考，围绕镜头构图、界面层级与动态节奏展开的网页重构。保留画面的表现力，同时把导航、内容与交互重新组织为真实的前端组件。项目当前为私有；这里的封面是原创几何示意，并非原作画面或项目截图。', facts:[['形式','动态网页'],['关注','画面与组件的对应'],['入口','个人私有作品']]},
 {id:'dialogue', no:'02', category:'INTERFACE DESIGN STUDY', title:'DIALOGUE', subtitle:'AI 对话桌面界面', status:'设计探索', description:'围绕对话、上下文与桌面工作流展开的界面设计探索。', tags:['信息层级','对话界面','桌面体验'], detail:'以 AI 对话桌面界面为主题的设计探索。关注长对话中的阅读层级，以及聊天内容与工作上下文如何在同一视野中共存。', facts:[['形式','界面设计探索'],['关注','对话与工作上下文'],['状态','未提供公开体验链接']]},
 {id:'archive', no:'03', category:'VISUAL & MOTION SYSTEM', title:'ARCHIVE', subtitle:'个人视觉档案', status:'当前作品', description:'从图形、光影与节奏出发，组织一套连续的个人主页体验。', tags:['视觉系统','场景转场','响应式设计'], detail:'当前的个人主页：以序章、作品、观测与关于四个章节组织内容，将构图、导航和动画作为一个连续的视觉系统。公开版本使用原创非人物环境图与代码绘制的几何封面，保留构图研究来源链接；不依赖 WebGL。', facts:[['形式','个人博客与作品集'],['关注','统一视觉与分章叙事'],['动效','支持暂停与减少动态效果']]}
];
export const studies = [
 {id:'tide', no:'01', anchor:'Voices / alchemaniac', title:'潮汐与留白', en:'TIDAL COMPOSITION', description:'冷色的大面积空间里，用一道红色建立视线的起点。曲线与碎片形成流向，让静止画面保留运动的余势。', credit:'Gilang Andrian · Voices', url:'https://www.gilangandrian.com/Arknights-EP-Illustration-Voices', className:'tide', keywords:['三角构图','冷暖焦点','弧形流向']},
 {id:'axis', no:'02', anchor:'Countess / Throne2', title:'中轴与仪式感', en:'AXIAL STRUCTURE', description:'高耸的纵向空间围绕单一中轴展开。扇形、尖拱与放射状结构，把目光收束在人物与光的交界。', credit:'Gilang Andrian · Red Countess / WLOP · Throne2', url:'https://www.gilangandrian.com/Iteration-Providence-Red-Countess', secondUrl:'https://wlop.artstation.com/projects/6bDlXn', className:'axis', keywords:['纵向空间','放射骨架','局部高光']},
 {id:'light', no:'03', anchor:'Golden / WLOP', title:'材质与微光', en:'MATERIAL & LIGHT', description:'近黑的底色托起少量金属反光。宽阔柔软的褶皱，与细小坚硬的亮点，形成不同尺度的节奏。', credit:'WLOP · Golden', url:'https://wlop.artstation.com/projects/n08J3r', className:'light', keywords:['反光层次','软硬对比','暗部留白']}
];
