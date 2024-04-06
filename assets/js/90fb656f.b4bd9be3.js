"use strict";(self.webpackChunkelastic_charts_docs=self.webpackChunkelastic_charts_docs||[]).push([[74771],{61518:(e,s,r)=>{r.r(s),r.d(s,{assets:()=>n,contentTitle:()=>a,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>o});var l=r(74848),t=r(28453);const i={},a=void 0,c={id:"all-types/interfaces/ColumnarViewModel",title:"ColumnarViewModel",description:"@elastic/charts \u2022 Exports",source:"@site/docs/all-types/interfaces/ColumnarViewModel.md",sourceDirName:"all-types/interfaces",slug:"/all-types/interfaces/ColumnarViewModel",permalink:"/elastic-charts/all-types/interfaces/ColumnarViewModel",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"ColorConfig",permalink:"/elastic-charts/all-types/interfaces/ColorConfig"},next:{title:"ControlReceiverCallbacks",permalink:"/elastic-charts/all-types/interfaces/ControlReceiverCallbacks"}},n={},o=[{value:"Contents",id:"contents",level:2},{value:"Properties",id:"properties",level:2},{value:"color",id:"color",level:3},{value:"Source",id:"source",level:4},{value:"label",id:"label",level:3},{value:"Source",id:"source-1",level:4},{value:"position0",id:"position0",level:3},{value:"Source",id:"source-2",level:4},{value:"position1",id:"position1",level:3},{value:"Source",id:"source-3",level:4},{value:"size0",id:"size0",level:3},{value:"Source",id:"source-4",level:4},{value:"size1",id:"size1",level:3},{value:"Source",id:"source-5",level:4},{value:"value",id:"value",level:3},{value:"Source",id:"source-6",level:4}];function h(e){const s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"@elastic/charts"})," \u2022 ",(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/",children:"Exports"})]}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/",children:"@elastic/charts"})," / ColumnarViewModel"]}),"\n",(0,l.jsx)(s.h1,{id:"interface-columnarviewmodel",children:"Interface: ColumnarViewModel"}),"\n",(0,l.jsx)(s.p,{children:"Column oriented data input for N data points:"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsx)(s.li,{children:"label: array of N strings"}),"\n",(0,l.jsx)(s.li,{children:"value: Float64Array of N numbers, for tooltip value display"}),"\n",(0,l.jsx)(s.li,{children:"color: Float32Array of 4 * N numbers, eg. green[i] = color[4 * i + 1]"}),"\n",(0,l.jsx)(s.li,{children:"position0: Tween from: Float32Array of 2 * N numbers with unit coordinates [x0, y0, x1, y1, ..., xN-1, yN-1]"}),"\n",(0,l.jsx)(s.li,{children:"position1: Tween to: Float32Array of 2 * N numbers with unit coordinates [x0, y0, x1, y1, ..., xN-1, yN-1]"}),"\n",(0,l.jsx)(s.li,{children:"size0: Tween from: Float32Array of N numbers with unit widths [width0, width1, ... , widthN-1]"}),"\n",(0,l.jsx)(s.li,{children:"size1: Tween to: Float32Array of N numbers with unit widths [width0, width1, ... , widthN-1]\nIf position0 === position1 and size0 === size1, then the nodes are not animated"}),"\n"]}),"\n",(0,l.jsx)(s.h2,{id:"contents",children:"Contents"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#properties",children:"Properties"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#color",children:"color"})}),"\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#label",children:"label"})}),"\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#position0",children:"position0"})}),"\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#position1",children:"position1"})}),"\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#size0",children:"size0"})}),"\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#size1",children:"size1"})}),"\n",(0,l.jsx)(s.li,{children:(0,l.jsx)(s.a,{href:"/elastic-charts/all-types/interfaces/ColumnarViewModel#value",children:"value"})}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,l.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,l.jsx)(s.h3,{id:"color",children:"color"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"color"}),": ",(0,l.jsx)(s.code,{children:"Float32Array"})]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L61",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:61"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsx)(s.h3,{id:"label",children:"label"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"label"}),": ",(0,l.jsx)(s.code,{children:"string"}),"[]"]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source-1",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L59",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:59"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsx)(s.h3,{id:"position0",children:"position0"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"position0"}),": ",(0,l.jsx)(s.code,{children:"Float32Array"})]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source-2",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L62",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:62"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsx)(s.h3,{id:"position1",children:"position1"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"position1"}),": ",(0,l.jsx)(s.code,{children:"Float32Array"})]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source-3",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L63",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:63"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsx)(s.h3,{id:"size0",children:"size0"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"size0"}),": ",(0,l.jsx)(s.code,{children:"Float32Array"})]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source-4",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L64",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:64"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsx)(s.h3,{id:"size1",children:"size1"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"size1"}),": ",(0,l.jsx)(s.code,{children:"Float32Array"})]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source-5",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L65",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:65"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsx)(s.h3,{id:"value",children:"value"}),"\n",(0,l.jsxs)(s.blockquote,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.strong,{children:"value"}),": ",(0,l.jsx)(s.code,{children:"Float64Array"})]}),"\n"]}),"\n",(0,l.jsx)(s.h4,{id:"source-6",children:"Source"}),"\n",(0,l.jsx)(s.p,{children:(0,l.jsx)(s.a,{href:"https://github.com/elastic/elastic-charts/blob/af6963375/packages/charts/src/chart_types/flame_chart/flame_api.ts#L60",children:"packages/charts/src/chart_types/flame_chart/flame_api.ts:60"})}),"\n",(0,l.jsx)(s.hr,{}),"\n",(0,l.jsxs)(s.p,{children:["Generated using ",(0,l.jsx)(s.a,{href:"https://www.npmjs.com/package/typedoc-plugin-markdown",children:"typedoc-plugin-markdown"})," and ",(0,l.jsx)(s.a,{href:"https://typedoc.org/",children:"TypeDoc"})]})]})}function d(e={}){const{wrapper:s}={...(0,t.R)(),...e.components};return s?(0,l.jsx)(s,{...e,children:(0,l.jsx)(h,{...e})}):h(e)}},28453:(e,s,r)=>{r.d(s,{R:()=>a,x:()=>c});var l=r(96540);const t={},i=l.createContext(t);function a(e){const s=l.useContext(i);return l.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),l.createElement(i.Provider,{value:s},e.children)}}}]);