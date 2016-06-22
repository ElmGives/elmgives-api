/**
 * Prepare data to be sent to slack channels
 */
'use strict';


module.exports = (data, options) => {
    const CHANNEL = process.env.SLACK_CHANNEL || 'build';
    const USERNAME = process.env.SLACK_USERNAME || 'ELM System Notification';
    const EMOJI = process.env.SLACK_EMOJI || ':elmgives:';

    return {
        token: options.token,
        channel: options.channel || CHANNEL,
        username: options.username || USERNAME,
        text: `\`\`\`${JSON.stringify(data, null, 4)}\`\`\``,
        'icon_emoji': options.emoji || EMOJI
    };
};
