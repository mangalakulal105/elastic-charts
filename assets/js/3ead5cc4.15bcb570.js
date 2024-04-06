"use strict";(self.webpackChunkelastic_charts_docs=self.webpackChunkelastic_charts_docs||[]).push([[88593],{92978:(e,s,l)=>{l.r(s),l.d(s,{assets:()=>a,contentTitle:()=>d,default:()=>h,frontMatter:()=>n,metadata:()=>r,toc:()=>o});var c=l(74848),i=l(28453);const n={id:"Heatmap",sidebar_position:5,sidebar_label:"Heatmap"},d="Heatmap Spec",r={id:"api/specs/Heatmap",title:"Heatmap Spec",description:"Defines a word cloud chart.",source:"@site/docs/api/specs/heatmap.mdx",sourceDirName:"api/specs",slug:"/api/specs/Heatmap",permalink:"/elastic-charts/api/specs/Heatmap",draft:!1,unlisted:!1,editUrl:"https://github.com/elastic/elastic-charts/blob/main/docs/",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"Heatmap",sidebar_position:5,sidebar_label:"Heatmap"},sidebar:"api",previous:{title:"Partition",permalink:"/elastic-charts/api/specs/Partition"},next:{title:"Metric",permalink:"/elastic-charts/api/specs/Metric"}},a={},o=[{value:"Overview",id:"overview",level:2},{value:"Compatible Specs",id:"compatible-specs",level:2},{value:"Overrides",id:"overrides",level:2},{value:"Props",id:"props",level:2},{value:"<code>Spec</code> Props",id:"spec-props",level:3},{value:"<code>data</code>",id:"data",level:3},{value:"<code>colorScale</code>",id:"colorscale",level:3},{value:"<code>xAccessor</code>",id:"xaccessor",level:3},{value:"<code>yAccessor</code>",id:"yaccessor",level:3},{value:"<code>valueAccessor</code>",id:"valueaccessor",level:3},{value:"<code>valueFormatter</code>",id:"valueformatter",level:3},{value:"<code>xSortPredicate</code>",id:"xsortpredicate",level:3},{value:"<code>ySortPredicate</code>",id:"ysortpredicate",level:3},{value:"<code>xScale</code>",id:"xscale",level:3},{value:"<code>highlightedData</code>",id:"highlighteddata",level:3},{value:"<code>name</code>",id:"name",level:3},{value:"<code>timeZone</code>",id:"timezone",level:3},{value:"<code>xAxisTitle</code>",id:"xaxistitle",level:3},{value:"<code>xAxisLabelName</code>",id:"xaxislabelname",level:3},{value:"<code>xAxisLabelFormatter</code>",id:"xaxislabelformatter",level:3},{value:"<code>yAxisTitle</code>",id:"yaxistitle",level:3},{value:"<code>yAxisLabelName</code>",id:"yaxislabelname",level:3},{value:"<code>yAxisLabelFormatter</code>",id:"yaxislabelformatter",level:3}];function t(e){const s={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)(s.h1,{id:"heatmap-spec",children:[(0,c.jsx)(s.code,{children:"Heatmap"})," Spec"]}),"\n",(0,c.jsx)(s.p,{children:"Defines a word cloud chart."}),"\n",(0,c.jsx)(s.h2,{id:"overview",children:"Overview"}),"\n",(0,c.jsx)(s.h2,{id:"compatible-specs",children:"Compatible Specs"}),"\n",(0,c.jsxs)(s.p,{children:[(0,c.jsx)(s.code,{children:"Heatmap"})," is a standalone spec and cannot be combined with other specs except for supported global specs."]}),"\n",(0,c.jsx)(s.admonition,{type:"warning",children:(0,c.jsxs)(s.p,{children:["The ",(0,c.jsx)(s.code,{children:"Heatmap"})," spec is ",(0,c.jsx)(s.strong,{children:"NOT"})," compatible with the ",(0,c.jsx)(s.a,{href:"./xy/Axis",children:(0,c.jsx)(s.code,{children:"Axis"})})," spec, it currently uses it's own internal axis implentation. The only axis controls are listed in the ",(0,c.jsx)(s.a,{href:"#props",children:(0,c.jsx)(s.code,{children:"Props"})})," below."]})}),"\n",(0,c.jsx)(s.h2,{id:"overrides",children:"Overrides"}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:[(0,c.jsx)(s.code,{children:"specType"})," -> ",(0,c.jsx)(s.code,{children:"SpecType.Series"})]}),"\n",(0,c.jsxs)(s.li,{children:[(0,c.jsx)(s.code,{children:"chartType"})," -> ",(0,c.jsx)(s.code,{children:"ChartType.Heatmap"})]}),"\n"]}),"\n",(0,c.jsx)(s.h2,{id:"props",children:"Props"}),"\n",(0,c.jsxs)(s.p,{children:["All props can be found via ",(0,c.jsx)(s.a,{href:"/all-types/type-aliases/HeatmapProps",children:(0,c.jsx)(s.code,{children:"HeatmapProps"})})," type."]}),"\n","\n",(0,c.jsxs)(s.h3,{id:"spec-props",children:[(0,c.jsx)(s.a,{href:"./types/Spec",children:(0,c.jsx)(s.code,{children:"Spec"})})," Props"]}),"\n",(0,c.jsxs)(s.p,{children:["Inherits ",(0,c.jsx)(s.a,{href:"./types/Spec",children:(0,c.jsx)(s.code,{children:"Spec"})})," props"]}),"\n",(0,c.jsx)(s.h3,{id:"data",children:(0,c.jsx)(s.code,{children:"data"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"data: D[]"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"colorscale",children:(0,c.jsx)(s.code,{children:"colorScale"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"colorScale: HeatmapBandsColorScale"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"xaccessor",children:(0,c.jsx)(s.code,{children:"xAccessor"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"xAccessor: Accessor<D> | AccessorFn<D>"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"(d) => d?.x"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"yaccessor",children:(0,c.jsx)(s.code,{children:"yAccessor"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"yAccessor: Accessor<D> | AccessorFn<D>"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"(d) => d?.y"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"valueaccessor",children:(0,c.jsx)(s.code,{children:"valueAccessor"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"valueAccessor: Accessor<never> | AccessorFn"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"({ value }) => value"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"valueformatter",children:(0,c.jsx)(s.code,{children:"valueFormatter"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"valueFormatter: ValueFormatter"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsxs)("code",{children:["(value) => ",(0,c.jsx)(s.code,{children:"${value}"})]})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"xsortpredicate",children:(0,c.jsx)(s.code,{children:"xSortPredicate"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"xSortPredicate: Predicate"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"Predicate.AlphaAsc"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"ysortpredicate",children:(0,c.jsx)(s.code,{children:"ySortPredicate"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"ySortPredicate: Predicate"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"Predicate.AlphaAsc"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"xscale",children:(0,c.jsx)(s.code,{children:"xScale"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"xScale: RasterTimeScale | OrdinalScale | LinearScale"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"{ type: X_SCALE_DEFAULT.type }"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"highlighteddata",children:(0,c.jsx)(s.code,{children:"highlightedData"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"highlightedData?: HeatmapHighlightedData"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"name",children:(0,c.jsx)(s.code,{children:"name"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"name?: string"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"timezone",children:(0,c.jsx)(s.code,{children:"timeZone"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"timeZone: string"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"'UTC'"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"xaxistitle",children:(0,c.jsx)(s.code,{children:"xAxisTitle"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"xAxisTitle: string"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"''"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"xaxislabelname",children:(0,c.jsx)(s.code,{children:"xAxisLabelName"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"xAxisLabelName: string"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"'X Value'"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"xaxislabelformatter",children:(0,c.jsx)(s.code,{children:"xAxisLabelFormatter"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"xAxisLabelFormatter: LabelAccessor<string | number>"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"String"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"yaxistitle",children:(0,c.jsx)(s.code,{children:"yAxisTitle"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"yAxisTitle: string"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"''"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"yaxislabelname",children:(0,c.jsx)(s.code,{children:"yAxisLabelName"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"yAxisLabelName: string"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"'Y Value'"})]}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"yaxislabelformatter",children:(0,c.jsx)(s.code,{children:"yAxisLabelFormatter"})}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsxs)(s.li,{children:["Type: ",(0,c.jsx)("code",{children:"yAxisLabelFormatter: LabelAccessor<string | number>"})]}),"\n",(0,c.jsxs)(s.li,{children:["Default: ",(0,c.jsx)(s.code,{children:"String"})]}),"\n"]})]})}function h(e={}){const{wrapper:s}={...(0,i.R)(),...e.components};return s?(0,c.jsx)(s,{...e,children:(0,c.jsx)(t,{...e})}):t(e)}},28453:(e,s,l)=>{l.d(s,{R:()=>d,x:()=>r});var c=l(96540);const i={},n=c.createContext(i);function d(e){const s=c.useContext(n);return c.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function r(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:d(e.components),c.createElement(n.Provider,{value:s},e.children)}}}]);