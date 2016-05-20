'use strict';

let tape = require('tape');
const EMOJI = 'icon_emoji';

tape('Slack Data helper', test => {
    test.plan(5);
    let slackData = require('../../../slack/prepareData');

    let data = {

    };

    let options = {
        token: 'foobar'
    };

    test.equal(slackData(data, options).token, 'foobar', 'proper token');
    test.equal(slackData(data, options).text, '```{}```', 'proper message');
    test.equal(slackData(data, options)[EMOJI], ':bicyclist:', 'proper icon');
    test.equal(slackData(data, options).channel, 'build', 'default channel');
    test.equal(slackData(data, options).username, 'Custom ELM Integration', 'default channel');
});

tape('Slack Data helper with environment settings', test => {
    test.plan(5);

    process.env.SLACK_CHANNEL = 'foobarchannel';
    process.env.SLACK_USERNAME = 'FOOBAR';
    process.env.SLACK_EMOJI = ':ghost:';

    let slackData = require('../../../slack/prepareData');
    let data = {};

    let options = {
        token: 'foobar'
    };

    test.equal(slackData(data, options).token, 'foobar', 'proper token');
    test.equal(slackData(data, options).text, '```{}```', 'proper message');
    test.equal(slackData(data, options)[EMOJI], ':ghost:', 'env icon');
    test.equal(slackData(data, options).channel, 'foobarchannel', 'env channel');
    test.equal(slackData(data, options).username, 'FOOBAR', 'env channel');
});

tape('Slack Data helper with options', test => {
    test.plan(5);

    let slackData = require('../../../slack/prepareData');
    let data = {
        foo: 'bar'
    };

    let options = {
        token: 'foobar',
        emoji: ':foobar:',
        channel: 'foo',
        username: 'test'
    };

    test.equal(slackData(data, options).token, 'foobar', 'proper token');
    test.equal(slackData(data, options).text, '```{\n    "foo": "bar"\n}```', 'proper message');
    test.equal(slackData(data, options)[EMOJI], ':foobar:', 'options icon');
    test.equal(slackData(data, options).channel, 'foo', 'options channel');
    test.equal(slackData(data, options).username, 'test', 'options channel');
});
