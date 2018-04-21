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
            };

        //------------------------------
        // Title
        //------------------------------
        frame.after(1, function () {
            model().clear();
            layout.invalidate();
        })
            .after(500, function () {
                frame.model().title =
                    '<h5 style="visibility:visible">Leader Election</h5>'
                    + '<h5 style="visibility:visible">领导人选举</h5>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(200, wait).indefinite()
            .after(500, function () {
                model().title = "";
                layout.invalidate();
            })

            //------------------------------
            // Initialization
            //------------------------------
            .after(300, function () {
                model().nodes.create("A").init();
                model().nodes.create("B").init();
                model().nodes.create("C").init();
                cluster(["A", "B", "C"]);
            })

            //------------------------------
            // Election Timeout
            //------------------------------
            .after(1, function () {
                model().ensureSingleCandidate();
                model().subtitle =
                    '<p>In Raft there are two timeout settings which control elections.</p>'
                    + '<p>在Raft算法中，会有两个超时时间设置来控制选举过程</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(model().electionTimeout / 2, function () {
                model().controls.show();
            })
            .after(100, function () {
                subtitle(
                    '<p>First is the <span style="color:#f0ad4e">election timeout</span>.</p>'
                    + '<p>首先是 <span style="color:#f0ad4e">竞选超时</span>。</p>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<p>The election timeout is the amount of time a follower waits until becoming a candidate.</p>'
                    + '<p>竞选超时是指跟随者成为候选人的时间</p>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<p>The election timeout is randomized to be between 150ms and 300ms.</p>'
                    + '<p>竞选超时一般是150毫秒到300毫秒之间的随机数</p>'
                );
            })
            .after(1, function () {
                subtitle("", false);
            })

            //------------------------------
            // Candidacy
            //------------------------------
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "candidate");
            })
            .after(1, function () {
                subtitle(
                    '<p>After the election timeout the follower becomes a candidate and starts a new ﻿<span style="color:#f0ad4e">election term</span>...</p>'
                    + '<p>当到达竞选超时时间后，跟随者转变为候选人角色，并进入到 <span style="color:#f0ad4e">选举周期</span>...</p>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<p>...votes for itself...</p>'
                    + '<p>...为自己发起投票...</p>'
                );
            })
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle(
                    '<p>...and sends out <span style="color:#f0ad4e">Request Vote</span> messages to other nodes.</p>'
                    + '<p>...此时候选人将发送 <span style="color:#f0ad4e">投票请求</span> 给其它节点</p>'
                );
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle(
                    '<p>If the receiving node hasn\'t voted yet in this term then it votes for the candidate...</p>'
                    + '<p>如果收到请求的节点在当前选举周期中还没有投过票，则这个节点会投票给这个候选人...</p>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<p>...and the node resets its election timeout.</p>'
                    + '<p>...然后这个节点重置它的选举周期时间，重新计时</p>'
                );
            })


            //------------------------------
            // Leadership & heartbeat timeout.
            //------------------------------
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "leader");
            })
            .after(1, function () {
                subtitle(
                    '<p>Once a candidate has a majority of votes it becomes leader.</p>'
                    +'<p>一旦候选人获得半数以上的赞成投票，那么它将成为领导人</p>'
                );
            })
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle(
                    '<p>The leader begins sending out <span style="color:#f0ad4e">Append Entries</span> messages to its followers.</p>'
                    +'<p>之后领导人将发送 <span style="color:#f0ad4e">附加日志</span> 指令给跟随者</p>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<p>These messages are sent in intervals specified by the <span style="color:#d9534f">heartbeat timeout</span>.</p>'
                    +'<p>这些消息是周期性发送，也叫 <span style="color:#d9534f">心跳包</span>（以此来保证它的领导人地位）</p>'
                );
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle(
                    '<p>Followers then respond to each <span style="color:#f0ad4e">Append Entries</span> message.</p>'
                    +'<p>跟随者将响应 <span style="color:#f0ad4e">附加日志</span> 消息</p>'
                );
            })
            .after(1, function () {
                subtitle('', false);
            })
            .after(model().heartbeatTimeout * 2, function () {
                subtitle(
                    '<p>This election term will continue until a follower stops receiving heartbeats and becomes a candidate.</p>'
                    +'<p>选举周期将一直持续直到某个跟随者没有收到心跳包并成为候选人</p>'
                    , false);
            })
            .after(100, wait).indefinite()
            .after(1, function () {
                subtitle(
                    ''
                    , false);
            })

            //------------------------------
            // Leader re-election
            //------------------------------
            .after(model().heartbeatTimeout * 2, function () {
                subtitle('' +
                    '<p>Let\'s stop the leader and watch a re-election happen.</p>'
                    +'<p>现在，让我们停掉这个领导人，看下重新选举的过程</p>'
                    , false);
            })
            .after(100, wait).indefinite()
            .after(1, function () {
                subtitle('', false);
                model().leader().state("stopped")
            })
            .after(model().defaultNetworkLatency, function () {
                model().ensureSingleCandidate()
            })
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "leader");
            })
            .after(1, function () {
                subtitle(
                    '<p>Node ' + model().leader().id + ' is now leader of term ' + model().leader().currentTerm() + '.</p>'
                    +'<p>重新选举之后，节点 ' + model().leader().id + ' 是选举周期' + model().leader().currentTerm() + ' 时的领导人了</p>'
                    , false);
            })
            .after(1, wait).indefinite()

        //------------------------------
        // Split Vote
        //------------------------------
            .after(1, function () {
                subtitle(
                    '<p>Requiring a majority of votes guarantees that only one leader can be elected per term.</p>'
                    +'<p>多数票赞成能保证每届只有一个领导人可以当选</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>If two nodes become candidates at the same time then a split vote can occur.</p>'
                    +'<p>如果同一时间有两个候选人，则会出现投票分裂的情况</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<p>Let\'s take a look at a split vote example...</p>'
                    +'<p>让我们来看一个投票分裂的例子...</p>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle('', false);
                model().nodes.create("D").init().currentTerm(node("A").currentTerm());
                cluster(["A", "B", "C", "D"]);

                // Make sure two nodes become candidates at the same time.
                model().resetToNextTerm();
                var nodes = model().ensureSplitVote();

                // Increase latency to some nodes to ensure obvious split.
                model().latency(nodes[0].id, nodes[2].id, model().defaultNetworkLatency * 1.25);
                model().latency(nodes[1].id, nodes[3].id, model().defaultNetworkLatency * 1.25);
            })
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "candidate");
            })
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle('' +
                    '<p>Two nodes both start an election for the same term...</p>'
                    +'<p>在同一个周期里有两个节点同时发起了竞选请求...</p>'
                );
            })
            .after(model().defaultNetworkLatency * 0.75, function () {
                subtitle('' +
                    '<p>...and each reaches a single follower node before the other.</p>'
                    +'<p>...并且每个都收到了一个跟随者的投票响应</p>'
                );
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle('' +
                    '<p>Now each candidate has 2 votes and can receive no more for this term.</p>'
                    +'<p>现在，每个候选人都有两票，并且都无法获得更多选票</p>'
                );
            })
            .after(1, function () {
                subtitle('' +
                    '<p>The nodes will wait for a new election and try again.</p>'
                    +'<p>这种情况下，两个节点将等待一轮竞选超时后重新发起竞选请求</p>'
                    , false);
            })
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "leader");
            })
            .after(1, function () {
                model().resetLatencies();
                subtitle('' +
                    '<p>Node ' + model().leader().id + ' received a majority of votes in term ' + model().leader().currentTerm() + ' so it becomes leader.</p>'
                    +'<p>节点' + model().leader().id + ' 在 竞选超时' + model().leader().currentTerm() + ' 里得到了大多数选票，所以它成为了新领导人</p>'
                    , false);
            })
            .after(1, wait).indefinite()

            .then(function () {
                player.next();
            })


        player.play();
    };
});
