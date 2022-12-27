/*
These strings, e.g. 'C0001', come from OneTrust, and can be edited in the "categorizations" section of OneTrust's app.
Be sure to update this file if you make changes in OneTrust's app.
This file also exists in the DM and ID/Auth codebases
 */
const STRICTLY_NECESSARY = 'C0001';
const PERFORMANCE_AND_ANALYTICS = 'C0002';
const FUNCTIONAL = 'C0003';
const TARGETING_AND_SPONSOR = 'C0004';
const SOCIAL_MEDIA = 'C0005';

function hasConsentedTo(category) {
  // checking for "window" because this could run in a windowless unit-test environment
  if (window && typeof window.OnetrustActiveGroups !== 'undefined') {
    return window.OnetrustActiveGroups.split(',').includes(category);
  }

  return true;
}

module.exports = {
  STRICTLY_NECESSARY,
  PERFORMANCE_AND_ANALYTICS,
  FUNCTIONAL,
  TARGETING_AND_SPONSOR,
  SOCIAL_MEDIA,
  hasConsentedTo
}