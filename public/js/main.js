!function e(n,o,t){function r(a,l){if(!o[a]){if(!n[a]){var s="function"==typeof require&&require;if(!l&&s)return s(a,!0);if(i)return i(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var d=o[a]={exports:{}};n[a][0].call(d.exports,function(e){var o=n[a][1][e];return r(o?o:e)},d,d.exports,e,n,o,t)}return o[a].exports}for(var i="function"==typeof require&&require,a=0;a<t.length;a++)r(t[a]);return r}({1:[function(e,n,o){"use strict";window.kan=window.kan||{palette:["#20171C","#1E2A43","#28377D","#352747","#F285A5","#CA2E26","#B84526","#DA6C26","#453121","#916A47","#EEB641","#F6EB16","#7F7D31","#6EAD79","#2A4621","#F4EAE0"],currentColor:"#20171C",numPaths:10,paths:[]},paper.install(window);var t=e("./util");$(document).ready(function(){function e(){n(),o(),c(),d(),u(),p(),h()}function n(){var e=$("ul.palette-colors"),n=e.find("li"),o=20,t=30,r="palette-selected";n.on("click tap touch",function(){var e=$(this).find("svg.palette-color");e.hasClass(r)||($("."+r).removeClass(r).attr("width",o).attr("height",o).find("rect").attr("rx",0).attr("ry",0),e.addClass(r).attr("width",t).attr("height",t).find("rect").attr("rx",t/2).attr("ry",t/2),window.kan.currentColor=e.find("rect").attr("fill"))})}function o(){function e(e){if(u=[],e.changedPointers&&e.changedPointers.length>0){e.changedPointers.length>1&&console.log("event.changedPointers > 1");var n=e.center,o=new Point(n.x,n.y);c=new Path({strokeColor:window.kan.currentColor,fillColor:window.kan.currentColor,name:"bounds"}),s=new Path({strokeColor:window.kan.currentColor,name:"middle",strokeWidth:1}),c.add(o),s.add(o)}}function n(e){e.preventDefault();for(var n=e.center,o=new Point(n.x,n.y);u.length>y;)u.shift();var r=void 0,i=void 0,a=void 0,l=void 0,p=void 0,v=void 0,g=void 0,m=void 0,w=void 0,x=void 0;if(u.length>0){g=d,w=t.delta(o,g),x=w*C,x>=threshold&&(x=threshold),P=0;for(var M=0;M<u.length;M++)P+=u[M];k=Math.round((P/u.length+x)/2),m=Math.atan2(o.y-g.y,o.x-g.x),r=o.x+Math.cos(m+Math.PI/2)*k,i=o.y+Math.sin(m+Math.PI/2)*k,a=new Point(r,i),l=o.x+Math.cos(m-Math.PI/2)*k,p=o.y+Math.sin(m-Math.PI/2)*k,v=new Point(l,p),c.add(v),c.insert(0,a),s.add(o)}else w=1,m=0,x=w*C,x=Math.max(Math.min(x,f),h);paper.view.draw(),d=o,u.push(x)}function o(e){$=1;var n=e.center,o=new Point(n.x,n.y),r=new Group([c,s]);c.add(o),c.flatten(4),c.smooth(),c.simplify(),c.closed=!0,s.add(o),s.flatten(4),s.smooth(),s.simplify();var i=s.getCrossings();if(i.length>0){var a=new Path;a.copyContent(s),a.visible=!1;var l=a.resolveCrossings();l.visible=!1;var d=t.findInteriorCurves(l);if(d)for(var u=0;u<d.length;u++)d[u].visible=!0,d[u].closed=!0,d[u].fillColor=new Color(0,0),d[u].data.interior=!0,d[u].data.transparent=!0,r.addChild(d[u]),d[u].sendToBack();a.remove()}else console.log("no intersections");r.data.color=c.fillColor,console.log(r.rotation),p=r,v.push({type:"newGroup",id:r.id}),m&&r.animate([{properties:{scale:.9},settings:{duration:100,easing:"easeOut"}},{properties:{scale:1.11},settings:{duration:100,easing:"easeIn"}}])}function r(e){console.log("pinchstart",e),E.get("pan").set({enable:!1});var n=e.center,o=new Point(n.x,n.y),t=paper.project.hitTest(o,I);t?(x=t.item.parent,M=x.scale,b=x.rotation):console.log("hit no item")}function i(e){if(x){console.log("pinchmove",e),console.log(x);var n=e.scale,o=n/M;M=n,console.log(M,n,o);var t=e.rotation,r=t-b;b=t,console.log(b,t,r),x.rotate(r)}}function a(e){console.log("pinchend",e),setTimeout(function(){E.get("pan").set({enable:!0})},250)}function l(e){var n=e.center,o=new Point(n.x,n.y),t=paper.project.hitTest(o,I);if(t){var r=t.item,i=r.parent;r.data.interior?(console.log("interior"),r.data.transparent=!r.data.transparent,r.data.transparent?(r.fillColor=w,r.strokeColor=w):(r.fillColor=i.data.color,r.strokeColor=i.data.color),v.push({type:"fillChanged",id:r.id,fill:i.data.color,transparent:r.data.transparent})):console.log("not interior")}else console.log("hit no item")}paper.setup(g[0]);var s=void 0,c=void 0,d=void 0,u=void 0,p=void 0,h=0,f=20,C=.3,y=10,P=void 0,k=void 0,x=void 0,M=void 0,b=void 0,I={segments:!1,stroke:!0,fill:!0,tolerance:5},$=0,E=new Hammer.Manager(g[0]);E.add(new Hammer.Tap({event:"doubletap",taps:2})),E.add(new Hammer.Tap({event:"singletap"})),E.add(new Hammer.Pan({direction:Hammer.DIRECTION_ALL})),E.add(new Hammer.Pinch),E.get("doubletap").recognizeWith("singletap"),E.get("singletap").requireFailure("doubletap"),E.get("pan").requireFailure("pinch"),E.on("singletap",function(){console.log("singleTap")}),E.on("doubletap",l),E.on("panstart",e),E.on("panmove",n),E.on("panend",o),E.on("pinchstart",r),E.on("pinchmove",i),E.on("pinchend",a),E.on("pinchcancel",function(){E.get("pan").set({enable:!0})})}function r(){console.log("new pressed"),paper.project.activeLayer.removeChildren()}function i(){if(console.log("undo pressed"),!(v.length>0))return void console.log("no moves yet");var e=v.pop();switch(e.type){case"newGroup":var n=project.getItem({id:e.id});n?(console.log("removing group"),n.remove()):console.log("could not find matching group");break;case"fillChanged":var o=project.getItem({id:e.id});e.transparent?(o.fillColor=e.fill,o.strokeColor=e.fill):(o.fillColor=w,o.strokeColor=w);break;default:console.log("unknown case")}console.log(e)}function a(){console.log("play pressed")}function l(){console.log("tips pressed")}function s(){console.log("share pressed")}function c(){$(".main-controls .new").on("click tap touch",r)}function d(){$(".main-controls .undo").on("click",i)}function u(){$(".main-controls .play").on("click",a)}function p(){$(".aux-controls .tips").on("click",l)}function h(){$(".aux-controls .share").on("click",s)}function f(){e()}var v=[],g=($(window),$("body"),$("canvas#mainCanvas")),m=!0,w=new Color(0,0);f()})},{"./util":2}],2:[function(e,n,o){"use strict";function t(e){return e*Math.PI/180}function r(e){return 180*e/Math.PI}function i(e,n){return Math.sqrt(Math.pow(e.x-n.x,2)+Math.pow(e.y-n.y,2))}function a(e){var n=[];if(e&&e.children&&e.children.length){for(var o=0;o<e.children.length;o++){var t=e.children[o];t.closed&&n.push(new Path(t.segments))}return e.remove(),n}}function l(e){var n=(e._namedChildren.bounds[0],e._namedChildren.middle[0]),o=new Path;o.copyContent(n),o.visible=!1;var t=o.resolveCrossings();t.visible=!1,Base.each(t.children,function(e,n){e.closed?e.selected=!1:e.selected=!0,console.log(e,n)})}function s(e){console.log(group)}Object.defineProperty(o,"__esModule",{value:!0}),o.rad=t,o.deg=r,o.delta=i,o.findInteriorCurves=a,o.trueGroup=l,o.truePath=s},{}]},{},[1]);
//# sourceMappingURL=maps/main.js.map
