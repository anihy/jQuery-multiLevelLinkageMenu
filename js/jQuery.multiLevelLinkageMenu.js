/**
 * jquery.multiLevelLinkageMenu - multiLevel linkage menu function callback in jQuery
 *
 *  Date: 2014/9/29
 *
 * @author WenLiang
 * @version 1.0.0
 *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  example  ^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * html code:
 * <select class="form-control" data-multimenu-id="access" data-multimenu-level="1">
 *     <option value="">options1</option>
 *     ......
 * </select>
 * <select class="form-control" data-multimenu-id="access" data-multimenu-level="2" data-multimenu-init="选择城市">
 *      <option value="">options1</option>
 *      ......
 * </select>
 * <select class="form-control" data-multimenu-id="access" data-multimenu-level="3" data-multimenu-init="选择区域">
 *     <option value="">options1</option>
 *     ......
 * </select>
 * <select class="form-control" data-multimenu-id="access" data-multimenu-level="4" data-multimenu-init="选择商圈">
 *     <option value="">options1</option>
 *     ......
 * </select>
 *
 * javascript code:
 * $(function(){
 *     $.multilevelLinkageMenu({
 *         // data-multimenu-id 对应的唯一标记名
 *         multiMenuMark: 'access',
 *         handler:{
 *             //一级菜单的处理函数,如果存在 则可用于一级菜单的初始化,
 *             //currenSelect 为一级菜单的 select jQuery DOM 引用
 *             menu1: function(currentSelect){
 *                 console.log('init level1 menu');
 *              },
 *              //二级菜单的处理函数,当上一级菜单更新的时候,
 *              //会调用该处理函数进行二级菜单的初始化 ,
 *              //prevSelect 为上一级菜单的 select jQuery DOM 引用: 也就是一级菜单
 *              //currenSelect 为当前菜单的 select jQuery DOM 引用: 也就是二级菜单:
 *              menu2: function(prevSelect,currentSelect){
 *                  console.log('update level2 menu');
 *                  console.log(prevSelect.attr('data-multimenu-level')+' '+currentSelect.attr('data-multimenu-level'));
 *                  currentSelect.append('<option>'+(new Date()).getTime()+'</option>')
 *              },
 *              //同上
 *              menu3: function(prevSelect,currentSelect){
 *                  console.log('update level3 menu');
 *              },
 *              menu4: function(prevSelect,currentSelect){
 *                  console.log('update level4 menu');
 *              }
 *          }
 *      });
 *  });
 */
(function(jQuery) {
    // 默认的配置参数
    var defaults = {
        multiMenuMarkAttr: 'data-multimenu-id', // 标记多级联动菜单的属性
        multiMenuLevelAttr: 'data-multimenu-level', // 定义多级联动菜单等级的属性, 从 1 开始计数
        multiMenuInitAttr: 'data-multimenu-init', // 重置多级联动菜单的属性
        menuList: [] //以 level 作为 key 的多级菜单数组
    };

    jQuery.multilevelLinkageMenu = function(options) {
        var options = jQuery.extend(true, {}, defaults, options);
        //获取所有被标记的多级联动菜单,
        //如果为空则停止后面的方法调用
        var multiMenus = jQuery("select[" + options.multiMenuMarkAttr + "='" + options.multiMenuMark + "']");
        if (multiMenus.length <= 0) return;

        //获取相应等级 select 的更新处理方法
        function getHandlerMethod(level) {
            var methodName = 'menu' + level;
            if (typeof options.handler === 'object' && typeof options.handler[methodName] === 'function') {
                return options.handler[methodName];
            }
        }

        //为所有 select 绑定 change event,
        //当 select 内容发生改变时, 低于 select 等级的所有 select 都将进行重置,
        // 当前 select 的下一级 select 将调用 更新处理方法, 
        // 更新处理方法传入两个参数 - function(prevMenu, menu)
        // 第一个参数为上一级菜单 jQuery DOM,
        // 第二个参数为当前菜单的 jQuery DOM 引用
        return multiMenus.each(function(index, element) {
            //获取当前 select,及对应的等级,将其存储到 menuList 中
            var select = jQuery(element);
            var level = parseInt(select.attr(options.multiMenuLevelAttr));
            options.menuList[level] = select;

            //绑定 change event,当 select 的值发生改变时,所有的相对下级 select 都将重置
            select.change(function() {
                var initValue, lowerMenu;
                if (typeof options.menuList[level + 1] === 'object') {
                    for (var i = level + 1, length = options.menuList.length - 1; i <= length; i++) {
                        lowerMenu = options.menuList[i];
                        initValue = lowerMenu.attr(options.multiMenuInitAttr);
                        if (initValue) {
                            lowerMenu.html('<option>' + initValue + '</option>');
                        } else {
                            lowerMenu.html('');
                        }
                    }

                    // 当前 select 的下一级 select 将调用更新处理方法
                    var handlerMethod = getHandlerMethod(level + 1);
                    if (typeof handlerMethod === 'function') {
                        handlerMethod(select, options.menuList[level + 1]);
                    }
                }
            });
        });

        // 如果 第一级 select 的更新处理方法存在,
        // 则调用它,传入的参数为当前的 select jQuery DOM
        var initMethod = getHandlerMethod(1);
        if (typeof initMethod === 'function') {
            initMethod(options.menuList[1]);
        }
    };
})(jQuery);