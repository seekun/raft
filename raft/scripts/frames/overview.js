"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../model/log_entry"], function (LogEntry) {
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
                    player.play();
                    self.stop();
                });
            };

        frame.after(1, function () {
            model().nodeLabelVisible = false;
            model().clear();
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            layout.invalidate();
        })

            .after(800, function () {
                model().subtitle =
                    '<p>﻿<span style="color:#f0ad4e">Raft</span> is a protocol for implementing distributed consensus.</p>'
                    + '<p>而<span style="color:#f0ad4e"> Raft算法</span> 就是为了解决分布式一致性问题</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>Let\'s look at a high level overview of how it works.</p>'
                    + '<p>接下来让我们了解一下它是如何工作的</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(100, function () {
                frame.snapshot();
                model().zoom([node("b")]);
                model().subtitle =
                    '<p>A node can be in 1 of 3 states:</p>'
                    + '<p>在Raft算法中，一个节点会在三种角色状态之间变化，这三种角色分别是:</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                node("b")._state = "follower";
                model().subtitle =
                    '<p>The <span style="color:#f0ad4e">Follower</span> state,</p>'
                    + '<p><span style="color:#f0ad4e">跟随者</span> 角色</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                node("b")._state = "candidate";
                model().subtitle =
                    '<p>the <span style="color:#f0ad4e">Candidate</span> state,</p>'
                    + '<p> <span style="color:#f0ad4e">候选人</span> 角色</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                node("b")._state = "leader";
                model().subtitle =
                    '<p>or the <span style="color:#f0ad4e">Leader</span> state.</p>'
                    + '<p>以及 <span style="color:#f0ad4e">领导者</span> 角色</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()

            .after(300, function () {
                frame.snapshot();
                model().zoom(null);
                node("b")._state = "follower";
                model().subtitle =
                    '<p>All our nodes start in the follower state.</p>'
                    + '<p>初始化时，所有的节点都是跟随者</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>If followers don\'t hear from a leader then they can become a candidate.</p>'
                    + '<p>如果一段时间后，跟随者没有监听到领导者发来的消息，那么自己将变成候选人身份</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, function () {
                node("a")._state = "candidate";
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>The candidate then requests votes from other nodes.</p>'
                    + '<p>随后，候选人将向其它节点发起一次选举投票请求</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, function () {
                model().send(node("a"), node("b"), {type: "RVREQ"})
                model().send(node("a"), node("c"), {type: "RVREQ"})
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>Nodes will reply with their vote.</p>'
                    + '<p>接收到的节点会回复（响应）这次投票</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(300, function () {
                model().send(node("b"), node("a"), {type: "RVRSP"}, function () {
                    node("a")._state = "leader";
                    layout.invalidate();
                })
                model().send(node("c"), node("a"), {type: "RVRSP"}, function () {
                    node("a")._state = "leader";
                    layout.invalidate();
                })
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>The candidate becomes the leader if it gets votes from a majority of nodes.</p>'
                    + '<p>如果大多数节点都投票赞同，那么这个候选人将成为"领导人"</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>This process is called <span style="color:#f0ad4e">Leader Election</span>.</p>'
                    + '<p>这个过程叫 <span style="color:#f0ad4e">领导人选举</span> </p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>All changes to the system now go through the leader.</p>'
                    + '<p>这之后所有的变化指令都由这个领导人来决定</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle += " ";
                model().clients.create("x");
                layout.invalidate();
            })
            .after(1000, function () {
                client("x")._value = "5";
                layout.invalidate();
            })
            .after(500, function () {
                model().send(client("x"), node("a"), null, function () {
                    node("a")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                    layout.invalidate();
                });
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>Each change is added as an entry in the node\'s log.</p>'
                    + '<p>每次更改指令会先记录到节点的日志里</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>This log entry is currently uncommitted so it won\'t update the node\'s value.</p>'
                    + '<p>不过要注意的是，这条记录日志还没有被提交，所以还不会更改节点的值</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(300, function () {
                frame.snapshot();
                model().send(node("a"), node("b"), {type: "AEREQ"}, function () {
                    node("b")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                    layout.invalidate();
                });
                model().send(node("a"), node("c"), {type: "AEREQ"}, function () {
                    node("c")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                    layout.invalidate();
                });
                model().subtitle =
                    '<p>To commit the entry the node first replicates it to the follower nodes...</p>'
                    + '<p>然后在提交之前，领导人节点会将变更指令同步到跟随者的节点日志中...</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().send(node("b"), node("a"), {type: "AEREQ"}, function () {
                    node("a")._commitIndex = 1;
                    node("a")._value = "5";
                    layout.invalidate();
                });
                model().send(node("c"), node("a"), {type: "AEREQ"});
                model().subtitle =
                    '<p>then the leader waits until a majority of nodes have written the entry.</p>'
                    + '<p>随后领导人进入等待状态，直到收到大多数节点记录成功的响应</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(1000, function () {
                node("a")._commitIndex = 1;
                node("a")._value = "5";
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>The entry is now committed on the leader node and the node state is "5".</p>'
                    + '<p>这时，领导人将提交这条记录，当前存储的值变为5</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().send(node("a"), node("b"), {type: "AEREQ"}, function () {
                    node("b")._value = "5";
                    node("b")._commitIndex = 1;
                    layout.invalidate();
                });
                model().send(node("a"), node("c"), {type: "AEREQ"}, function () {
                    node("c")._value = "5";
                    node("c")._commitIndex = 1;
                    layout.invalidate();
                });
                model().subtitle =
                    '<p>The leader then notifies the followers that the entry is committed.</p>'
                    + '<p>然后领导人通知所有跟随者提交记录</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>The cluster has now come to consensus about the system state.</p>'
                    + '<p>最终，集群状态达成一致了</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(300, function () {
                frame.snapshot();
                model().subtitle =
                    '<p>This process is called ﻿<span style="color:#f0ad4e">Log Replication</span>.</p>'
                    + '<p>这个两次提交（2PC）的过程叫作 ﻿<span style="color:#f0ad4e">日志复制</span></p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()


            .after(300, function () {
                frame.snapshot();
                player.next();
            })


        player.play();
    };
});
