!function e(n,t,o){function r(d,a){if(!t[d]){if(!n[d]){var c="function"==typeof require&&require;if(!a&&c)return c(d,!0);if(i)return i(d,!0);var l=new Error("Cannot find module '"+d+"'");throw l.code="MODULE_NOT_FOUND",l}var s=t[d]={exports:{}};n[d][0].call(s.exports,function(e){var t=n[d][1][e];return r(t?t:e)},s,s.exports,e,n,t,o)}return t[d].exports}for(var i="function"==typeof require&&require,d=0;d<o.length;d++)r(o[d]);return r}({1:[function(e,n,t){"use strict";window.kan=window.kan||{palette:["#20171C","#1E2A43","#28377D","#352747","#F285A5","#CA2E26","#B84526","#DA6C26","#453121","#916A47","#EEB641","#F6EB16","#7F7D31","#6EAD79","#2A4621","#F4EAE0"],currentColor:"#20171C",numPaths:10,paths:[]},paper.install(window);var o=e("./util");$(document).ready(function(){function e(){n(),t(),l(),s(),u(),h(),f()}function n(){var e=$("ul.palette-colors"),n=e.find("li"),t=20,o=30,r="palette-selected";n.on("click tap touch",function(){var e=$(this).find("svg.palette-color");e.hasClass(r)||($("."+r).removeClass(r).attr("width",t).attr("height",t).find("rect").attr("rx",0).attr("ry",0),e.addClass(r).attr("width",o).attr("height",o).find("rect").attr("rx",o/2).attr("ry",o/2),window.kan.currentColor=e.find("rect").attr("fill"))})}function t(){function e(e){if(a=[],e.gesture.changedPointers&&e.gesture.changedPointers.length>0){e.gesture.changedPointers.length>1&&console.log("event.gesture.changedPointers > 1");var n=e.gesture.center,t=new Point(n.x,n.y);i=new CompoundPath({children:[new Path({name:"bounds"}),new Path({name:"middle"})],strokeColor:window.kan.currentColor,fillColor:window.kan.currentColor}),i.children.bounds.add(t),i.children.middle.add(t),i.children.middle.visible=!1}}function n(e){e.preventDefault();for(var n=e.gesture.center,t=new Point(n.x,n.y);a.length>u;)a.shift();var r=void 0,c=void 0,p=void 0,v=void 0,m=void 0,g=void 0,w=void 0,y=void 0,P=void 0,C=void 0;if(a.length>0){w=d,P=o.delta(t,w),C=P*s,C>=l&&(C=l),h=0;for(var x=0;x<a.length;x++)h+=a[x];f=Math.round((h/a.length+C)/2),y=Math.atan2(t.y-w.y,t.x-w.x),r=t.x+Math.cos(y+Math.PI/2)*f,c=t.y+Math.sin(y+Math.PI/2)*f,p=new Point(r,c),v=t.x+Math.cos(y-Math.PI/2)*f,m=t.y+Math.sin(y-Math.PI/2)*f,g=new Point(v,m),i.children.bounds.add(g),i.children.bounds.insert(0,p),i.children.bounds.smooth(),i.children.middle.add(t)}else P=1,y=0,C=P*s,C>=l&&(C=l);paper.view.draw(),d=t,a.push(C)}function t(e){m=1;var n=e.gesture.center,t=new Point(n.x,n.y);i.children.bounds.add(t),i.children.bounds.smooth(),i.children.bounds.simplify(0),i.children.bounds.closed=!0,i.children.middle.add(t),i.children.middle.smooth(),i.children.middle.closed=!1,c=i;for(var o=(i.children.middle.getCrossings(),0);o<i.children.middle.segments.length;o++){i.children.middle.segments[o]}}function r(e){var n=e.gesture.center,t=new Point(n.x,n.y),o=paper.project.hitTest(t,p);o&&(o.item.selected=!o.item.selected)}paper.setup(v[0]);var i=void 0,d=void 0,a=void 0,c=void 0,l=20,s=.3,u=10,h=void 0,f=void 0,p={segments:!1,stroke:!0,fill:!0,tolerance:5},m=0;v.hammer().on("panstart",e).on("panmove",n).on("panend",t).on("tap",r),v.data("hammer").get("pan").set({direction:Hammer.DIRECTION_ALL})}function r(){console.log("new pressed"),paper.project.activeLayer.removeChildren()}function i(){console.log("undo pressed")}function d(){console.log("play pressed")}function a(){console.log("tips pressed")}function c(){console.log("share pressed")}function l(){$(".main-controls .new").on("click tap touch",r)}function s(){$(".main-controls .undo").on("click",i)}function u(){$(".main-controls .play").on("click",d)}function h(){$(".aux-controls .tips").on("click",a)}function f(){$(".aux-controls .share").on("click",c)}function p(){e()}var v=($(window),$("body"),$("canvas#mainCanvas"));p()})},{"./util":2}],2:[function(e,n,t){"use strict";function o(e){return e*Math.PI/180}function r(e){return 180*e/Math.PI}function i(e,n){return Math.sqrt(Math.pow(e.x-n.x,2)+Math.pow(e.y-n.y,2))}Object.defineProperty(t,"__esModule",{value:!0}),t.rad=o,t.deg=r,t.delta=i},{}]},{},[1]);
//# sourceMappingURL=maps/main.js.map
