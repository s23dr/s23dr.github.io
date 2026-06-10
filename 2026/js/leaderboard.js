var SCORE_KEYS = ['hss_mean', 'hss_q5', 'hss_q25', 'hss_q50', 'hss_q75', 'hss_q95', 'corner_f1_mean', 'edge_iou_mean'];
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

  teams.sort(function (a, b) {
    var aScore = (a[activeTab] && a[activeTab].hss_mean != null) ? a[activeTab].hss_mean : -Infinity;
    var bScore = (b[activeTab] && b[activeTab].hss_mean != null) ? b[activeTab].hss_mean : -Infinity;
    return bScore - aScore;
  });

  var medalCount = 0;
  var seenGroups = {};  // group name → medal index already awarded

  var rows = teams.map(function (team, i) {
    var rank = i + 1;
    var score = team[activeTab];
    var isBaseline = team.is_baseline;
    var group = team.group || null;

    var rankDisplay = String(rank);
    var medalIdx = -1;
    var groupAlreadyMedalled = group && (group in seenGroups);

    if (!isBaseline && score && medalCount < 3 && !groupAlreadyMedalled) {
      medalIdx = medalCount;
      rankDisplay = MEDALS[medalCount] + ' ' + rank;
      medalCount++;
      if (group) seenGroups[group] = medalIdx;
    }

    var scoreCells = SCORE_KEYS.map(function (k) {
      return '<td class="score-val">' + (score ? fmt(score[k]) : '&mdash;') + '</td>';
    }).join('');

    var comment = (score && score.submission_comment) ? score.submission_comment : '';
    var commentCell = '<td class="comment-cell" title="' + escHtml(comment) + '">'
      + (comment ? escHtml(comment) : '&mdash;') + '</td>';

    var rowClass = isBaseline ? 'baseline' : (medalIdx >= 0 ? 'rank-' + (medalIdx + 1) : '');
    if (groupAlreadyMedalled) rowClass = 'merged-team';

    var displayName = escHtml(team.name.replace(/\s*\[orgs\]/i, '').replace(/\s*\[baseline\]/i, '').trim());
    var nameSuffix = '';
    if (isBaseline) nameSuffix = ' <span class="baseline-tag">baseline</span>';
    else if (group) nameSuffix = ' <span class="baseline-tag" style="background:#e0f2fe;color:#0369a1;border-color:#7dd3fc">merged</span>';
    var nameCell = displayName + nameSuffix;

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
  if (leaderboardData) renderTable();
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
      '<tr><td colspan="11">Failed to load leaderboard data.</td></tr>';
    console.error(err);
  });
