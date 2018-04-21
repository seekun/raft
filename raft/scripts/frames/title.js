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
                frame.model().title = '<h4 style="visibility:visible">Raft</h4>'
                    + '<h5 style="visibility:visible">Understandable Distributed Consensus</h5>'
                    + '<h5 style="visibility:visible">轻松理解分布式一致性算法——Raft</h5>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().subtitle = '<p style="visibility:visible">' +
                    '<a href="http://7player.cn/" target="_blank">7player.cn</a> | ' +
                    '<a href="http://7player.cn/" target="_blank">中文</a> | ' +
                    '<a href="http://thesecretlivesofdata.com/raft/" target="_blank">英文原版</a> ' +
                    '</p>';
                layout.invalidate();
                frame.model().controls.show();
            })


            .after(100, function () {
                player.next();
            })

        player.play();
    };
});
