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
                    '<h4 style="visibility:visible">Log Replication</h4>'
                    + '<h4 style="visibility:visible">日志复制</h4>'
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
                    '<h5>Once we have a leader elected we need to replicate all changes to our system to all nodes.</h5>'
                    + '<h5>一旦选举出了领导者，我们需要向所有节点通知这一消息，并需要持续维持领导人地位</h5>'
                    , false);
            })
            .then(wait).indefinite()
            .then(function () {
                subtitle('' +
                    '<h5>This is done by using the same ﻿<span style="color:#f0ad4e">Append Entries</span> message that was used for heartbeats.</h5>'
                    + '<h5>这是通过周期性的发送 ﻿<span style="color:#f0ad4e">附加日志</span> 消息（心跳包）实现的</h5>'
                    , false);
            })
            .then(wait).indefinite()
            .then(function () {
                subtitle(
                    '<h5>Let\'s walk through the process.</h5>'
                    + '<h5>让我们看下这个过程</h5>'
                    , false);
            })
            .then(wait).indefinite()


        //------------------------------
        // Single Entry Replication
        //------------------------------
            .then(function () {
                model().clients.create("X");
                subtitle(
                    '<h5>First a client sends a change to the leader.</h5>'
                    + '<h5>首先，一个客户端发送变化的数据给领导人</h5>'
                    , false);
            })
            .then(wait).indefinite()
            .then(function () {
                client("X").send(model().leader(), "SET 5");
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle(
                    '<h5>The change is appended to the leader\'s log...</h5>'
                    + '<h5>这条变更记录被添加到领导人的日志里...</h5>'
                );
            })
            .at(model(), "appendEntriesRequestsSent", function () {
            })
            .after(model().defaultNetworkLatency * 0.25, function (event) {
                subtitle(
                    '<h5>...then the change is sent to the followers on the next heartbeat.</h5>'
                    + '<h5>...然后在下一个心跳中将变更记录发送给跟随者</h5>'
                );
            })
            .after(1, clear)
            .at(model(), "commitIndexChange", function (event) {
                if (event.target === model().leader()) {
                    subtitle(
                        '<h5>An entry is committed once a majority of followers acknowledge it...</h5>'
                        + '<h5>一旦大多数的跟随者确认了这条记录，那么这条记录就会被提交...</h5>'
                    );
                }
            })
            .after(model().defaultNetworkLatency * 0.25, function (event) {
                subtitle(
                    '<h5>...and a response is sent to the client.</h5>'
                    + '<h5>...最后将响应客户端</h5>'
                );
            })
            .after(1, clear)
            .after(model().defaultNetworkLatency, function (event) {
                subtitle(
                    '<h5>Now let\'s send a command to increment the value by "2".</h5>'
                    + '<h5>比如，我们希望加"2"</h5>'
                );
                client("X").send(model().leader(), "ADD 2");
            })
            .after(1, clear)
            .at(model(), "recv", function (event) {
                subtitle('' +
                    '<h5>Our system value is now updated to "7".</h5>'
                    + '<h5>最终我们系统里的值变成"7"了</h5>'
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
                    '<h5>Raft can even stay consistent in the face of network partitions.</h5>'
                    + '<h5>Raft甚至可以在网络分区的情况下保持一致</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h5>Let\'s add a partition to separate A & B from C, D & E.</h5>'
                    + '<h5>假如我们增加了一个分区，并将A和B分为一组，C、D和E分为一组</h5>'
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
                    '<h5>Because of our partition we now have two leaders in different terms.</h5>'
                    + '<h5>由于分区原因，系统中出现了两个不同的领导人</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                model().clients.create("Y");
                subtitle(
                    '<h5>Let\'s add another client and try to update both leaders.</h5>'
                    + '<h5>现在新加一个客户端并且试着修改两个领导人的数据</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                client("Y").send(node("B"), "SET 3");
                subtitle(
                    '<h5>One client will try to set the value of node B to "3".</h5>'
                    + '<h5>其中一个客户端将把节点B的值设置为"3"</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h5>Node B cannot replicate to a majority so its log entry stays uncommitted.</h5>'
                    + '<h5>但节点B不能同步大多数，所以他的日志记录仍为未提交</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                var leader = model().leader(["C", "D", "E"]);
                client("X").send(leader, "SET 8");
                subtitle(
                    '<h5>The other client will try to set the value of node ' + leader.id + ' to "8".</h5>'
                    + '<h5>另一个客户端将修改 节点' + leader.id + ' 的值为"8"</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h5>This will succeed because it can replicate to a majority.</h5>'
                    + '<h5>因为可以同步大多数，所以这个操作能够成功</h5>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h5>Now let\'s heal the network partition.</h5>'
                    + '<h5>随后，我们修复了网络分区问题</h5>'
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
                    '<h5>Node B will see the higher election term and step down.</h5>'
                    + '<h5>节点B将会发现存在"更高领导人"，所以将会选择"下台"</h5>'
                );
            })
            .after(1, function () {
                subtitle('' +
                    '<h5>Both nodes A & B will roll back their uncommitted entries and match the new leader\'s log.</h5>'
                    + '<h5>此时，节点A和节点B将会回滚它们未提交的记录，并同步新领导人的日志</h5>'
                );
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h5>Our log is now consistent across our cluster.</h5>'
                    + '<h5>最终，我们集群达成了一致</h5>'
                    , false);
            })
            .after(1, wait).indefinite()

            .then(function () {
                player.next();
            })

        player.play();
    };
});
