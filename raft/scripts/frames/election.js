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
                    '<h2 style="visibility:visible">Leader Election</h1>'
                    + '<h2 style="visibility:visible">领导人选举</h1>'
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
                    '<h2>In Raft there are two timeout settings which control elections.</h2>'
                    + '<h2>在Raft算法中，会有两个超时时间设置来控制选举过程</h2>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(model().electionTimeout / 2, function () {
                model().controls.show();
            })
            .after(100, function () {
                subtitle(
                    '<h2>First is the <span style="color:#f0ad4e">election timeout</span>.</h2>'
                    + '<h2>首先是 <span style="color:#f0ad4e">竞选超时</span>。</h2>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<h2>The election timeout is the amount of time a follower waits until becoming a candidate.</h2>'
                    + '<h2>竞选超时是指跟随者成为候选人的时间</h2>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<h2>The election timeout is randomized to be between 150ms and 300ms.</h2>'
                    + '<h2>竞选超时一般是150毫秒到300毫秒之间的随机数</h2>'
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
                    '<h2>After the election timeout the follower becomes a candidate and starts a new ﻿<span style="color:#f0ad4e">election term</span>...</h2>'
                    + '<h2>当到达竞选超时时间后，跟随者转变为候选人角色，并开始一个新的 <span style="color:#f0ad4e">选举周期</span>...</h2>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<h2>...votes for itself...</h2>'
                    + '<h2>...为自己发起投票...</h2>'
                );
            })
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle(
                    '<h2>...and sends out <span style="color:#f0ad4e">Request Vote</span> messages to other nodes.</h2>'
                    + '<h2>...并且发送 <span style="color:#f0ad4e">投票请求</span> 给其它节点</h2>'
                );
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle(
                    '<h2>If the receiving node hasn\'t voted yet in this term then it votes for the candidate...</h2>'
                    + '<h2>如果收到请求的节点在当前选举周期中还没有投过票，则这个节点会投票给这个候选人...</h2>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<h2>...and the node resets its election timeout.</h2>'
                    + '<h2>...然后这个节点重置它的选举周期时间，从新计时</h2>'
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
                    '<h2>Once a candidate has a majority of votes it becomes leader.</h2>'
                    +'<h2>一旦某个获得半数以上的投票结果，则它将成为领导人</h2>'
                );
            })
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle(
                    '<h2>The leader begins sending out <em>Append Entries</em> messages to its followers.</h2>'
                    +'<h2>之后领导人将发送 <em>附加日志</em> 的消息给跟随者</h2>'
                );
            })
            .after(1, function () {
                subtitle(
                    '<h2>These messages are sent in intervals specified by the <span style="color:red">heartbeat timeout</span>.</h2>'
                    +'<h2>这些消息是周期性发送，也叫 <span style="color:red">心跳包</span>。</h2>'
                );
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle(
                    '<h2>Followers then respond to each <em>Append Entries</em> message.</h2>'
                    +'<h2>跟随者将响应 <em>附加日志</em> 消息</h2>'
                );
            })
            .after(1, function () {
                subtitle('', false);
            })
            .after(model().heartbeatTimeout * 2, function () {
                subtitle(
                    '<h2>This election term will continue until a follower stops receiving heartbeats and becomes a candidate.</h2>'
                    +'<h2>选举周期将一直持续知道某个跟随者停止收到心跳包并成为候选人</h2>'
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
                    '<h2>Let\'s stop the leader and watch a re-election happen.</h2>'
                    +'<h2>让我们停掉这个领导人，看下重新选举的过程</h2>'
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
                    '<h2>Node ' + model().leader().id + ' is now leader of term ' + model().leader().currentTerm() + '.</h2>'
                    +'<h2>节点 ' + model().leader().id + ' 是选举周期 ' + model().leader().currentTerm() + '的领导人。</h2>'
                    , false);
            })
            .after(1, wait).indefinite()

        //------------------------------
        // Split Vote
        //------------------------------
            .after(1, function () {
                subtitle(
                    '<h2>Requiring a majority of votes guarantees that only one leader can be elected per term.</h2>'
                    +'<h2>多数投票能保证每届只有一个领导人可以当选</h2>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h2>If two nodes become candidates at the same time then a split vote can occur.</h2>'
                    +'<h2>如果同一时间有两个候选人，则会出现分裂投票的情况</h2>'
                    , false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle(
                    '<h2>Let\'s take a look at a split vote example...</h2>'
                    +'<h2>让我们来看一个分裂投票的例子...</h2>'
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
                    '<h2>Two nodes both start an election for the same term...</h2>'
                    +'<h2>有两个节点在一个周期里都发起了选举请求...</h2>'
                );
            })
            .after(model().defaultNetworkLatency * 0.75, function () {
                subtitle('' +
                    '<h2>...and each reaches a single follower node before the other.</h2>'
                    +'<h2>...并且每个都收到了一个跟随者的投票响应</h2>'
                );
            })
            .after(model().defaultNetworkLatency, function () {
                subtitle('' +
                    '<h2>Now each candidate has 2 votes and can receive no more for this term.</h2>'
                    +'<h2>现在，每个候选人都有两票，并且都无法获得更多选票</h2>'
                );
            })
            .after(1, function () {
                subtitle('' +
                    '<h2>The nodes will wait for a new election and try again.</h2>'
                    +'<h2>两个节点将等待一轮选举周期后重试</h2>'
                    , false);
            })
            .at(model(), "stateChange", function (event) {
                return (event.target.state() === "leader");
            })
            .after(1, function () {
                model().resetLatencies();
                subtitle('' +
                    '<h2>Node ' + model().leader().id + ' received a majority of votes in term ' + model().leader().currentTerm() + ' so it becomes leader.</h2>'
                    +'<h2>节点 ' + model().leader().id + ' 在选举周期 ' + model().leader().currentTerm() + '里得到了大多数选票，所以他成为了领导人</h2>'
                    , false);
            })
            .after(1, wait).indefinite()

            .then(function () {
                player.next();
            })


        player.play();
    };
});
