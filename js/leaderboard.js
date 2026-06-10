var SCORE_KEYS = ['WED2', 'WED_mu', 'WED_p5', 'WED_p25', 'WED_p50', 'WED_p75', 'WED_p95'];
var MEDALS = ['🥇', '🥈', '🥉'];
var activeTab = 'private';
var leaderboardData = null;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(val) {
  return (val != null) ? Number(val).toFixed(4) : '&mdash;';
}

function renderTable() {
  var teams = leaderboardData.teams.slice();

  // Re-sort by active tab's WED2 ascending (null scores last)
  teams.sort(function (a, b) {
    var aScore = (a[activeTab] && a[activeTab].WED2 != null) ? a[activeTab].WED2 : Infinity;
    var bScore = (b[activeTab] && b[activeTab].WED2 != null) ? b[activeTab].WED2 : Infinity;
    return aScore - bScore;
  });

  var medalCount = 0;
  var rows = teams.map(function (team, i) {
    var rank = i + 1;
    var score = team[activeTab];
    var isBaseline = team.is_baseline;

    // Medal for top 3 non-baseline teams with a score
    var rankDisplay = String(rank);
    if (!isBaseline && score && medalCount < 3) {
      rankDisplay = MEDALS[medalCount] + ' ' + rank;
      medalCount++;
    }

    // Score cells
    var scoreCells = SCORE_KEYS.map(function (k) {
      return '<td class="score-val">' + (score ? fmt(score[k]) : '&mdash;') + '</td>';
    }).join('');

    // Comment cell
    var comment = (score && score.submission_comment) ? score.submission_comment : '';
    var commentCell = '<td class="comment-cell" title="' + escHtml(comment) + '">'
      + (comment ? escHtml(comment) : '&mdash;') + '</td>';

    // Row class
    var rowClass = isBaseline ? 'baseline' : (rank <= 3 ? 'rank-' + rank : '');

    // Team name: strip [baseline] tag and show as separate badge
    var displayName = escHtml(team.name.replace(/\s*\[baseline\]/i, '').trim());
    var nameCell = displayName + (isBaseline ? ' <span class="baseline-tag">baseline</span>' : '');

    return '<tr class="' + rowClass + '">'
      + '<td>' + rankDisplay + '</td>'
      + '<td>' + nameCell + '</td>'
      + scoreCells
      + commentCell
      + '</tr>';
  });

  document.getElementById('lb-tbody').innerHTML = rows.join('');
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-private').classList.toggle('active', tab === 'private');
  document.getElementById('tab-public').classList.toggle('active', tab === 'public');
  renderTable();
}

fetch('data/leaderboard.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    leaderboardData = data;
    document.getElementById('lb-generated').textContent =
      'Data generated: ' + data.generated.replace('T', ' ').replace('Z', ' UTC');
    renderTable();
  })
  .catch(function (err) {
    document.getElementById('lb-tbody').innerHTML =
      '<tr><td colspan="10">Failed to load leaderboard data.</td></tr>';
    console.error(err);
  });
