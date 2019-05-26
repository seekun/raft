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
                frame.model().title = '<h5 style="visibility:visible">Raft</h5>'
                    + '<h5 style="visibility:visible">Understandable Distributed Consensus</h5>'
                    + '<h5 style="visibility:visible">轻松理解分布式一致性算法——Raft</h5>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().subtitle = '<p style="visibility:visible">' +
                    '<div>网络工程科研导论第13组: 魏奇, 周杨皓, 王渝川, 石坤, 吕友豪 </div>' +
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
