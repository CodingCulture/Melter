var $ = require("jquery");
var md = require("markdown-it")();
var gui = require('nw.gui');
var fs = require('fs');

var win = gui.Window.get();

var fileMenu = new gui.Menu();
fileMenu.append(new gui.MenuItem({label: "Save"}));
fileMenu.append(new gui.MenuItem({label: "Open"}));
fileMenu.append(new gui.MenuItem({label: "Help"}));
var menubar = new gui.Menu({type: "menubar"});
menubar.createMacBuiltin("Melter");
win.menu = menubar;

/*
 * Events
 */
$(document).ready(function(){
    $('#save, #open').hide();
    var $target = $('.target');

    $target
        .append($('<div />').addClass('editor').html($('<textarea />')))
        .append($('<div />').addClass('preview').addClass('markdown-body'));

    $('.editor textarea')
        .on("input", function(e){
            var rc = new renderController();
            rc.init(e);
        })
        .on("scroll", function(){
           var top = $(this).scrollTop();
            var accelerator = ($('.preview').get(0).scrollHeight / 100) * (top / ($(this).get(0).scrollHeight) * 100);
            console.log(top + ' of the ' + $(this).get(0).scrollHeight + ' : ' + accelerator + ' of the ' + $('.preview').get(0).scrollHeight);
            $('.preview').scrollTop($(this).height() + Math.ceil(accelerator) + 20);
        });
});

$(document).keydown(function(e) {
    //Save Event
    if (e.keyCode == 83 && e.metaKey){
        var saveTrigger = $('#save');
        saveTrigger.unbind('change').change(function(evt){
            var fsc = new fileSystemController();
            fsc.writer($(this).val(), $('.editor textarea').val());
        }).trigger('click');
    }

    //Load Event
    if (e.keyCode == 79 && e.metaKey){
        var openTrigger = $('#open');
        openTrigger.unbind('change').change(function(evt){
            var fsc = new fileSystemController();
            fsc.reader($(this).val(), $('.editor textarea'), function(){
                console.log("Callback");
                var rc = new renderController();
                rc.setContent($('.editor textarea').val());
            });
        }).trigger('click');
    }
});

var renderController = function(){
    this.init = function(e){
        var tree = e.target.value;
        this.setContent(tree);
    };
    this.setContent = function(data){
        $('.preview').html(md.render(data));
    }
};

var fileSystemController = function(){
    this.init = function(){
        if(fs == undefined){
            alert('Saving to disk is not possible. Please reboot the app');
        }
    };
    this.writer = function(path, contents){
        fs.writeFile(path, contents, function(exception){
            if(exception){
                alert('Something went wrong with saving the file. Try again');
            }
        });
    };
    this.reader = function(path, target, callback){

        var data = fs.readFile(path, 'utf8', function(err, data){
            if(err) throw error;
            if(err) {alert("Couldn't open file " + err);}
            target.val(data);

            callback();
        });
        return data;
    };
    this.init();
};
