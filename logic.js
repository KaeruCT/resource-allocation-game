function generateProfile(availableOptions) {
  const minLikes = 1;
  const maxLikes = 2;
  const minDislikes = 0;
  const maxDislikes = 2;

  let options = [...availableOptions];
  shuffle(options);

  const likes = range(randInRange(minLikes, maxLikes))
    .map(() => options.pop());
  const dislikes = range(randInRange(minDislikes, maxDislikes))
    .map(() => options.pop());

  return {
    likes,
    dislikes,
  };
}

function testDistribution(availableOptions, profiles) {
  const scores = {
    happy: 1,
    neutral: .5,
    unhappy: 0,
  }
  const available = { ...availableOptions };
  const distribution = [];
  const advice = [];
  const nonFulfilled = [];
  const result = [];

  // sort profiles by count of likes (ascending)
  profiles = [...profiles].sort((a, b) => {
    return a.likes.length - b.likes.length
  });

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    let fulfilled = false;
    profile.likes.sort();
    for (let j = 0; j < profile.likes.length; j++) {
      const o = profile.likes[j];
      if (available[o]) {
        available[o] -= 1;
        distribution.push(o);
        fulfilled = true;
        result.push(scores.happy);
        break;
      }
    }
    if (!fulfilled) {
      nonFulfilled.push(profile);
    }
  }

  // sort nonFulfilled by count of dislikes (descending)
  nonFulfilled.sort((a, b) => {
    return b.dislikes.length - a.dislikes.length
  });

  for (let i = 0; i < nonFulfilled.length; i++) {
    const profile = nonFulfilled[i];
    const o = Object.keys(available).find(o => o !== profile.dislikes && available[o]);
  
    if (o) {
      available[o] -= 1;
      distribution.push(o);
      result.push(scores.neutral);
      advice.push(`-${o}`);
    } else {
      distribution.push(null);
      result.push(scores.unhappy);
    }
    advice.push(...profile.likes);
  }

  const avgScore = result.reduce((total, score) => total + score, 0) / result.length;

  return {
    advice: humanizeAdvice(advice),
    distribution,
    score: `${avgScore * 100}%`,
  }
}

function humanizeAdvice(advice) {
  const grouped = {};
  for (let i = 0; i < advice.length; i++) {
    const adv = advice[i];
    if (!grouped[adv]) grouped[adv] = 0;
    grouped[adv] += 1;
  }

  return Object.keys(grouped).map(adv => {
    const count = grouped[adv];
    let text = adv.startsWith('-') ?
      `Less ${adv.substr(1)}` :
      `More ${adv}`;

    if (count > 1) text += ` (${count})`;
    return text;
  });
}

function Game({
  slots,
  options, 
  rounds,
  onScore,
  onChoose,
  onFinish,
}) {
  this.profiles = range(slots).map(() => generateProfile(options));

  this.currentRound = 1;
  this.rounds = [];

  onChoose();

  this.finishRound = choices => {
    const result = testDistribution(choices, this.profiles);

    this.rounds.push(result);

    onScore(result);

    if (this.rounds.length === rounds) {
      onFinish(result);
    }
  }
}
