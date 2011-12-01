
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

// place any jQuery/helper plugins in here, instead of separate, slower script files.
// JQuery Dialog Plugin
var Dialog=function(content,options){var defaults={title:'Title',showTitle:true,closeText:'[Close]',draggable:true,modal:true,center:true,fixed:true,time:0,id:false};var options=$.extend(defaults,options);options.id=options.id?options.id:'dialog-'+Dialog.__count;var overlayId=options.id+'-overlay';var timeId=null;var isShow=false;var isIe=$.browser.msie;var isIe6=$.browser.msie&&('6.0'==$.browser.version);var barHtml=!options.showTitle?'':'<div class="bar"><span class="title">'+options.title+'</span><a class="close">'+options.closeText+'</a></div>';var dialog=$('<div id="'+options.id+'" class="dialog">'+barHtml+'<div class="content"></div></div>').hide();$('body').append(dialog);var resetPos=function(){if(options.center){var left=($(window).width()-dialog.width())/2;var top=($(window).height()-dialog.height())/2;if(!isIe6&&options.fixed){dialog.css({top:top,left:left});}else{dialog.css({top:top+$(document).scrollTop(),left:left+$(document).scrollLeft()});}}};var init=function(){if(options.modal){$('body').append('<div id="'+overlayId+'" class="dialog-overlay"></div>');$('#'+overlayId).css({'left':0,'top':0,'width':'100%','height':$(document).height(),'z-index':++Dialog.__zindex,'position':'absolute'}).hide();}dialog.css({'z-index':++Dialog.__zindex,'position':options.fixed?'fixed':'absolute'});if(isIe6&&options.fixed){dialog.css('position','absolute');resetPos();var top=parseInt(dialog.css('top'))-$(document).scrollTop();var left=parseInt(dialog.css('left'))-$(document).scrollLeft();$(window).scroll(function(){dialog.css({'top':$(document).scrollTop()+top,'left':$(document).scrollLeft()+left});});}var mouse={x:0,y:0};function moveDialog(event){var e=window.event||event;var top=parseInt(dialog.css('top'))+(e.clientY-mouse.y);var left=parseInt(dialog.css('left'))+(e.clientX-mouse.x);dialog.css({top:top,left:left});mouse.x=e.clientX;mouse.y=e.clientY;};dialog.find('.bar').mousedown(function(event){if(!options.draggable){return;}var e=window.event||event;mouse.x=e.clientX;mouse.y=e.clientY;$(document).bind('mousemove',moveDialog);});$(document).mouseup(function(event){$(document).unbind('mousemove',moveDialog);});dialog.find('.close').bind('click',this.close);dialog.bind('mousedown',function(){dialog.css('z-index',++Dialog.__zindex);});if(0!=options.time){timeId=setTimeout(this.close,options.time);}};this.setContent=function(c){var div=dialog.find('.content');if('object'==typeof(c)){switch(c.type.toLowerCase()){case'id':div.html($('#'+c.value).html());break;case'img':div.html('加载中...');$('<img alt="" />').load(function(){div.empty().append($(this));resetPos();}).attr('src',c.value);break;case'url':div.html('加载中...');$.ajax({url:c.value,success:function(html){div.html(html);resetPos();},error:function(xml,textStatus,error){div.html('出错啦')}});break;case'iframe':div.append($('<iframe src="'+c.value+'" />'));break;case'text':default:div.html(c.value);break;}}else{div.html(c);}};this.show=function(){if(undefined!=options.beforeShow&&!options.beforeShow()){return;}var getOpacity=function(id){if(!isIe){return $('#'+id).css('opacity');}var el=document.getElementById(id);return(undefined!=el&&undefined!=el.filters&&undefined!=el.filters.alpha&&undefined!=el.filters.alpha.opacity)?el.filters.alpha.opacity/100:1;};if(options.modal){$('#'+overlayId).fadeTo('slow',getOpacity(overlayId));}dialog.fadeTo('slow',getOpacity(options.id),function(){if(undefined!=options.afterShow){options.afterShow();}isShow=true;});if(0!=options.time){timeId=setTimeout(this.close,options.time);}resetPos();};this.hide=function(){if(!isShow){return;}if(undefined!=options.beforeHide&&!options.beforeHide()){return;}dialog.fadeOut('slow',function(){if(undefined!=options.afterHide){options.afterHide();}});if(options.modal){$('#'+overlayId).fadeOut('slow');}isShow=false;};this.close=function(){if(undefined!=options.beforeClose&&!options.beforeClose()){return;}dialog.fadeOut('slow',function(){$(this).remove();isShow=false;if(undefined!=options.afterClose){options.afterClose();}});if(options.modal){$('#'+overlayId).fadeOut('slow',function(){$(this).remove();});}clearTimeout(timeId);};init.call(this);this.setContent(content);Dialog.__count++;Dialog.__zindex++;};Dialog.__zindex=500;Dialog.__count=1;Dialog.version='1.0 beta';function dialog(content,options){var dlg=new Dialog(content,options);dlg.show();return dlg;}


/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};
