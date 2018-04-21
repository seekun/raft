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
            cluster = function (value) {
                model().nodes.toArray().forEach(function (node) {
                    node.cluster(value);
                });
            },
            wait = function () {
                var self = this;
                model().controls.show(function () {
                    self.stop();
                });
            },
            subtitle = function (s, pause) {
                model().subtitle = s + model().controls.html();
                layout.invalidate();
                if (pause === undefined) {
                    model().controls.show()
                }
                ;
            },
            clear = function () {
                subtitle('', false);
            },
            removeAllNodes = function () {
                model().nodes.toArray().forEach(function (node) {
                    node.state("stopped");
                });
                model().nodes.removeAll();
            };

        //------------------------------
        // Title
        //------------------------------
        frame.after(0, function () {
            model().clear();
            layout.invalidate();
        })
            .after(500, function () {
                frame.model().title =
                    '<h5 style="visibility:visible">Log Replication</h5>'
                    + '<h5 style="visibility:visible">日志复制</h5>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(200, wait).indefinite()
            .after(500, function () {
                model().title = "";
                layout.invalidate();
            })

            //------------------------------
            // Cluster Initialization
            //------------------------------
            .after(300, function () {
                model().nodes.create("A");
                model().nodes.create("B");
                model().nodes.create("C");
                cluster(["A", "B", "C"]);
                layout.invalidate();
            })
            .after(500, function () {
                model().forceImmediateLeader();
            })


            //------------------------------
            // Overview
            //------------------------------
            .then(function () {
                subtitle('' +
                    '<p>Once we have a leader elected we need to replicate all changes to our system to all nodes.</p>'
                    + '<p>一旦选举出了领导者，我们需要向所有节点通知这一消息，并需要持续维持领导人地位</p>'
                    , false);
            })
            .then(wait).indefinite()
            .then(function () {
                subtitle('' +
                    '<p>This is done by using the same ﻿<span style="color:#f0ad4e">Append Entries</span> message that was used for heartbeats.</p>'
                    + '<p>这是通过周期性的发送 ﻿<span style="color:#f0ad4e">附加日志</span> 消息（心跳包）实现的</p>'
                    , false);
            })
            .then(wait).indefinite()
            .then(function () {
                subtitle(
                    '<p>Let\'s walk through the process.</p>'
                    + '<p>让我们看下这个过程</p>'
                    , false);
            })
            .then(wait).indefinite()


        //------------------------------
        // Single Entry Replication
        //------------------------------
            .then(function () {
                model().clients.create("X");
                subtitle(
                    '<p>First a client sends a change to the leader.</p>'
                    + '<p>首先，一个客户端发送变化的数据给领导人</p>'
                    , false);
            })
            .then(wait).indefinite()
            .then(function () {
                client("X").send(model().leader(), "SET 5");
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle(
                    '<p>The change is appended to the leader\'s log...</p>'
                    + '<p>这条变更记录被添加到领导人的日志里...</p>'
                );
            })
            .at(model(), "appendEntriesRequestsSent", function () {
            })
            .after(model().defaultNetworkLatency * 0.25, function (event) {
                subtitle(
                    '<p>...then the change is sent to the followers on the next heartbeat.</p>'
                    + '<p>...然后在下一个心跳中将变更记录发送给跟随者</p>'
                );
            })
            .after(1, clear)
            .at(model(), "commitIndexChange", function (event) {
                if (event.target === model().leader()) {
                    subtitle(
                        '<p>An entry is committed once a majority of followers acknowledge it...</p>'
                        + '<p>一旦大多数的跟随者确认了这条记录，那么这条记录就会被提交...</p>'
                    );
                }
            })
            .after(model().defaultNetworkLatency * 0.25, function (event) {
                subtitle(
                    '<p>...and a response is sent to the client.</p>'
                    + '<p>...最后将响应客户端</p>'
                );
            })
            .after(1, clear)
            .after(model().defaultNetworkLatency, function (event) {
                subtitle(
                    '<p>Now let\'s send a command to increment the value by "2".</p>'
                    + '<p>比如，我们希望加"2"</p>'
                );
                client("X").send(model().leader(), "ADD 2");
            })
            .after(1, clear)
            .at(model(), "recv", function (event) {
                subtitle('' +
                    '<p>Our system value is now updated to "7".</p>'
                    + '<p>最终我们系统里的值变成"7"了</p>'
                    , false);
            })
            .after(1, wait).indefinite()


        //------------------------------
        // Network Partition
        //------------------------------
            .after(1, function () {
                removeAllNodes();
                model().nodes.create("A");
                model().nodes.create("B");
                model().nodes.create("C");
                model().nodes.create("D");
                model().nodes.create("E");
                layout.invalidate();
            })
            .after(500, function () {
                node("A").init();
                node("B").init();
                node("C").init();
                node("D").init();
                node("E").init();
                cluster(["A", "B", "C", "D", "E"]);
                model().resetToNextTerm();
                node("B").state("leader");
            })
            .after(1, function () {
                subtitle(
                    '<p>Raft can even stay consistent in the face of network partitions.</p>'
                    + '<p>Raft甚至可以在网络分区的情况下保持一致</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>Let\'s add a partition to separate A & B from C, D & E.</p>'
                    + '<p>假如我们增加了一个分区，并将A和B分为一组，C、D和E分为一组</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                model().latency("A", "C", 0).latency("A", "D", 0).latency("A", "E", 0);
                model().latency("B", "C", 0).latency("B", "D", 0).latency("B", "E", 0);
                model().ensureExactCandidate("C");
            })
            .after(model().defaultNetworkLatency * 0.5, function () {
                var p = model().partitions.create("-");
                p.x1 = Math.min.apply(null, model().nodes.toArray().map(function (node) {
                    return node.x;
                }));
                p.x2 = Math.max.apply(null, model().nodes.toArray().map(function (node) {
                    return node.x;
                }));
                p.y1 = p.y2 = Math.round(node("B").y + node("C").y) / 2;
                layout.invalidate();
            })
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "leader");
            })
            .after(1, function () {
                subtitle(
                    '<p>Because of our partition we now have two leaders in different terms.</p>'
                    + '<p>由于分区原因，系统中出现了两个不同的领导人</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                model().clients.create("Y");
                subtitle(
                    '<p>Let\'s add another client and try to update both leaders.</p>'
                    + '<p>现在新加一个客户端并且试着修改两个领导人的数据</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                client("Y").send(node("B"), "SET 3");
                subtitle(
                    '<p>One client will try to set the value of node B to "3".</p>'
                    + '<p>其中一个客户端将把节点B的值设置为"3"</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>Node B cannot replicate to a majority so its log entry stays uncommitted.</p>'
                    + '<p>但节点B不能同步大多数，所以他的日志记录仍为未提交</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                var leader = model().leader(["C", "D", "E"]);
                client("X").send(leader, "SET 8");
                subtitle(
                    '<p>The other client will try to set the value of node ' + leader.id + ' to "8".</p>'
                    + '<p>另一个客户端将修改 节点' + leader.id + ' 的值为"8"</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>This will succeed because it can replicate to a majority.</p>'
                    + '<p>因为可以同步大多数，所以这个操作能够成功</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>Now let\'s heal the network partition.</p>'
                    + '<p>随后，我们修复了网络分区问题</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                model().partitions.removeAll();
                layout.invalidate();
            })
            .after(200, function () {
                model().resetLatencies();
            })
            .at(model(), "stateChange", function (event) {
                return (event.target.id === "B" && event.target.state() === "follower");
            })
            .after(1, function () {
                subtitle(
                    '<p>Node B will see the higher election term and step down.</p>'
                    + '<p>节点B将会发现存在"更高领导人"，所以将会选择"下台"</p>'
                );
            })
            .after(1, function () {
                subtitle('' +
                    '<p>Both nodes A & B will roll back their uncommitted entries and match the new leader\'s log.</p>'
                    + '<p>此时，节点A和节点B将会回滚它们未提交的记录，并同步新领导人的日志</p>'
                );
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>Our log is now consistent across our cluster.</p>'
                    + '<p>最终，我们集群达成了一致</p>'
                    , false);
            })
            .after(1, wait).indefinite()

            .then(function () {
                player.next();
            })

        player.play();
    };
});
