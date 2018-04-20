"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function () {
                return frame.model();
            },
            client = function (id) {
                return frame.model().clients.find(id);
            },
            node = function (id) {
                return frame.model().nodes.find(id);
            },
            wait = function () {
                var self = this;
                model().controls.show(function () {
                    self.stop();
                });
            };

        frame.after(1, function () {
            model().nodeLabelVisible = false;
            frame.snapshot();
            frame.model().clear();
            layout.invalidate();
        })

            .after(1000, function () {
                frame.model().title =
                    '<h2 style="visibility:visible">So What is Distributed Consensus?</h2>'
                    + '<h2 style="visibility:visible">那么，什么是分布式一致性协议?</h2>'
                    + '<h3 style="visibility:hidden;">Let\'s start with an example...</h3>'
                    + '<h3 style="visibility:hidden;">先来看个示例吧...</h3>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(1000, function () {
                layout.fadeIn($(".title h3"));
            })
            .after(1000, function () {
                frame.model().controls.show();
            })
            .after(50, function () {
                frame.model().title = frame.model().subtitle = "";
                layout.invalidate();
            })


            .after(800, function () {
                frame.snapshot();
                frame.model().subtitle =
                    '<h2>Let\'s say we have a single node system</h2>'
                    + '<h2>假如现在有一个单节点的系统</h2>'
                    + frame.model().controls.html();
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().nodes.create("a");
                layout.invalidate();
            })
            .after(100, wait).indefinite()

            .after(100, function () {
                frame.snapshot();
                frame.model().subtitle = "";
                frame.model().zoom([node("a")]);
                layout.invalidate();
            })
            .after(600, function () {
                frame.model().subtitle =
                    '<h3>For this example, you can think of our <span style="color:steelblue">node</span> as a database server that stores a single value.</h3>'
                    + '<h3>比如, 这个 <span style="color:steelblue">节点</span> 是一个数据库，并且存储在一个值（x）</h3>'
                    + frame.model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                node("a")._value = "x";
                layout.invalidate();
            })
            .after(100, wait).indefinite()

            .after(100, function () {
                frame.snapshot();
                frame.model().subtitle = "";
                frame.model().zoom(null);
                layout.invalidate();
            })
            .after(1000, function () {
                frame.model().subtitle =
                    '<h3>We also have a <span style="color:green">client</span> that can send a value to the server.</h3>'
                    + '<h3>另外，我们还有一个 <span style="color:green">客户端</span>可以发送数据到这个数据库服务</h3>'
                    + frame.model().controls.html();
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().clients.create("X");
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(100, function () {
                frame.snapshot();
                frame.model().subtitle += "";
                client("X").value("8");
                layout.invalidate();
            })
            .after(200, function () {
                frame.model().send(client("X"), node("a"), null, function () {
                    node("a")._value = "8";
                    layout.invalidate();
                });
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.model().subtitle =
                    '<h3>Coming to agreement, or <em>consensus</em>, on that value is easy with one node.</h3>'
                    + '<h3>在只有一个节点的情况下，达成<em>一致性</em>很容易实现</h3>'
                    + frame.model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(100, function () {
                frame.snapshot();
                frame.model().subtitle =
                    '<h3>But how do we come to consensus if we have multiple nodes?</h3>'
                    +'<h3>但是，在多个节点的情况下，如何实现一致性?</h3>'
                    + frame.model().controls.html();
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().nodes.create("b");
                layout.invalidate();
            })
            .after(500, function () {
                frame.model().nodes.create("c");
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(100, function () {
                frame.snapshot();
                frame.model().subtitle =
                    '<h3>That\'s the problem of <em>distributed consensus</em>.</h3>'
                    +'<h3>这就是所谓的 <em>分布式一致性问题</em>.</h3>'
                    + frame.model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()

            .after(300, function () {
                frame.snapshot();
                player.next();
            })


        frame.addEventListener("end", function () {
            frame.model().title = frame.model().subtitle = "";
            layout.invalidate();
        });

        player.play();
    };
});
