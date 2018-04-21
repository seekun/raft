"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout();

        frame.after(1, function () {
            frame.model().clear();
            layout.invalidate();
        })

            .after(500, function () {
                frame.model().title =
                    '<h4 style="visibility:visible">The End</h4>'
                    + '<h4 style="visibility:visible">至此就介绍完了，谢谢！</h4>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().controls.show();
            })

            .after(500, function () {
                frame.model().title =
                    '<h4 style="visibility:visible">For more information（了解更多）</h4>'
                    + '<h5 style="visibility:visible"><a href="https://ramcloud.stanford.edu/wiki/download/attachments/11370504/raft.pdf">The Raft Paper</a></h5>'
                    + '<h5 style="visibility:visible"><a href="https://raft.github.io/">Raft Web Site</a></h5>'
                    + '<h5 style="visibility:visible"><a href="http://7player.cn/2018/04/19/%E8%81%8A%E8%81%8A%E5%88%86%E5%B8%83%E5%BC%8F%E5%AD%98%E5%82%A8-%E5%9B%BE%E8%A7%A3paxos/">图解Paxos</a></h5>'
                    + '<h5 style="visibility:visible"><a href="http://7player.cn/">关于我</a> <a href="https://github.com/djmpink">Github</a></h5>'
                    + '<h6 style="visibility:visible">重看请刷新</h6>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })

        player.play();
    };
});
