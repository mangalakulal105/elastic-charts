"use strict";(self.webpackChunkelastic_charts_docs=self.webpackChunkelastic_charts_docs||[]).push([[93436],{10811:(e,s,i)=>{i.r(s),i.d(s,{assets:()=>o,contentTitle:()=>l,default:()=>h,frontMatter:()=>n,metadata:()=>d,toc:()=>t});var c=i(74848),r=i(28453);const n={id:"SeriesSpec",sidebar_label:"SeriesSpec"},l="SeriesSpec",d={id:"api/specs/types/SeriesSpec",title:"SeriesSpec",description:"Default spec for all XY series specs.",source:"@site/docs/api/specs/types/series_spec.mdx",sourceDirName:"api/specs/types",slug:"/api/specs/types/SeriesSpec",permalink:"/elastic-charts/api/specs/types/SeriesSpec",draft:!1,unlisted:!1,editUrl:"https://github.com/elastic/elastic-charts/blob/main/docs/",tags:[],version:"current",frontMatter:{id:"SeriesSpec",sidebar_label:"SeriesSpec"},sidebar:"api",previous:{title:"SeriesScales",permalink:"/elastic-charts/api/specs/types/SeriesScales"},next:{title:"Spec",permalink:"/elastic-charts/api/specs/types/Spec"}},o={},t=[{value:"Overrides",id:"overrides",level:2},{value:"Props",id:"props",level:2},{value:"<code>Spec</code> Props",id:"spec-props",level:3},{value:"<code>name</code>",id:"name",level:3},{value:"<code>groupId</code>",id:"groupid",level:3},{value:"<code>useDefaultGroupDomain</code>",id:"usedefaultgroupdomain",level:3},{value:"<code>data</code>",id:"data",level:3},{value:"<code>seriesType</code>",id:"seriestype",level:3},{value:"<code>color</code>",id:"color",level:3},{value:"<code>hideInLegend</code>",id:"hideinlegend",level:3},{value:"<code>displayValueSettings</code>",id:"displayvaluesettings",level:3},{value:"<code>y0AccessorFormat</code>",id:"y0accessorformat",level:3},{value:"<code>y1AccessorFormat</code>",id:"y1accessorformat",level:3},{value:"<code>filterSeriesInTooltip</code>",id:"filterseriesintooltip",level:3},{value:"<code>tickFormat</code>",id:"tickformat",level:3}];function a(e){const s={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...(0,r.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(s.h1,{id:"seriesspec",children:(0,c.jsx)(s.code,{children:"SeriesSpec"})}),"\n",(0,c.jsx)(s.p,{children:"Default spec for all XY series specs."}),"\n",(0,c.jsx)(s.h2,{id:"overrides",children:"Overrides"}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:[(0,c.jsx)(s.code,{children:"specType"})," -> ",(0,c.jsx)(s.code,{children:"SpecType.Series"})]}),"\n",(0,c.jsxs)(s.li,{children:[(0,c.jsx)(s.code,{children:"chartType"})," -> ",(0,c.jsx)(s.code,{children:"ChartType.XYAxis"})]}),"\n"]}),"\n",(0,c.jsx)(s.h2,{id:"props",children:"Props"}),"\n",(0,c.jsxs)(s.h3,{id:"spec-props",children:[(0,c.jsx)(s.a,{href:"./Spec",children:(0,c.jsx)(s.code,{children:"Spec"})})," Props"]}),"\n",(0,c.jsxs)(s.p,{children:["Inherits ",(0,c.jsx)(s.a,{href:"./Spec",children:(0,c.jsx)(s.code,{children:"Spec"})})," props"]}),"\n",(0,c.jsx)(s.h3,{id:"name",children:(0,c.jsx)(s.code,{children:"name"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"name?: SeriesNameAccessor"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"The name of the spec. Also a mechanism to provide custom series names."}),"\n",(0,c.jsx)(s.h3,{id:"groupid",children:(0,c.jsx)(s.code,{children:"groupId"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"groupId: string"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"DEFAULT_GLOBAL_ID"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"The ID of the spec group"}),"\n",(0,c.jsx)(s.h3,{id:"usedefaultgroupdomain",children:(0,c.jsx)(s.code,{children:"useDefaultGroupDomain"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"useDefaultGroupDomain?: boolean | string"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"When specify a groupId on this series, this option can be used to compute this series domain as it was part of the default group (when using the boolean value true) or as the series was part of the specified group (when issuing a string)."}),"\n",(0,c.jsx)(s.h3,{id:"data",children:(0,c.jsx)(s.code,{children:"data"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"data: D[]"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"Array of data"}),"\n",(0,c.jsx)(s.h3,{id:"seriestype",children:(0,c.jsx)(s.code,{children:"seriesType"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"seriesType: SeriesType"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"The type of series you are looking to render"}),"\n",(0,c.jsx)(s.h3,{id:"color",children:(0,c.jsx)(s.code,{children:"color"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"color?: SeriesColorAccessor"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"Color configuration to assign colors to specific series."}),"\n",(0,c.jsx)(s.h3,{id:"hideinlegend",children:(0,c.jsx)(s.code,{children:"hideInLegend"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"hideInLegend?: boolean"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"false"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"If the series should appear in the legend"}),"\n",(0,c.jsx)(s.h3,{id:"displayvaluesettings",children:(0,c.jsx)(s.code,{children:"displayValueSettings"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"displayValueSettings?: DisplayValueSpec"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"y0accessorformat",children:(0,c.jsx)(s.code,{children:"y0AccessorFormat"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"y0AccessorFormat?: AccessorFormat"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:" - upper"})]}),"\n"]}),"\n",(0,c.jsxs)(s.p,{children:["Postfix string or accessor function for y1 accessor when using ",(0,c.jsx)(s.code,{children:"y0Accessors"})]}),"\n",(0,c.jsx)(s.h3,{id:"y1accessorformat",children:(0,c.jsx)(s.code,{children:"y1AccessorFormat"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"y1AccessorFormat?: AccessorFormat"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:" - lower"})]}),"\n"]}),"\n",(0,c.jsxs)(s.p,{children:["Postfix string or accessor function for y1 accessor when using ",(0,c.jsx)(s.code,{children:"y0Accessors"})]}),"\n",(0,c.jsx)(s.h3,{id:"filterseriesintooltip",children:(0,c.jsx)(s.code,{children:"filterSeriesInTooltip"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"filterSeriesInTooltip?: FilterPredicate"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"Predicate used to hide series in tooltip."}),"\n",(0,c.jsx)(s.h3,{id:"tickformat",children:(0,c.jsx)(s.code,{children:"tickFormat"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"tickFormat?: TickFormatter"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"tickFormat"})]}),"\n"]}),"\n",(0,c.jsx)(s.p,{children:"A function called to format every value label."})]})}function h(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,c.jsx)(s,{...e,children:(0,c.jsx)(a,{...e})}):a(e)}},28453:(e,s,i)=>{i.d(s,{R:()=>l,x:()=>d});var c=i(96540);const r={},n=c.createContext(r);function l(e){const s=c.useContext(n);return c.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),c.createElement(n.Provider,{value:s},e.children)}}}]);