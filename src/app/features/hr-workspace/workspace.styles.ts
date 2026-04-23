export const WORKSPACE_STYLES = `
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }

  .hero {
    position: relative;
    overflow: hidden;
    padding: 28px;
    border-radius: 24px;
    border: 1px solid var(--border-accent-soft);
    background:
      linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)),
      radial-gradient(circle at top right, rgba(56, 189, 248, 0.2), transparent 36%);
    color: #f8fafc;
    box-shadow: 0 20px 48px var(--shadow-strong);
  }

  .hero::after {
    content: '';
    position: absolute;
    inset: auto -80px -110px auto;
    width: 240px;
    height: 240px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.24), transparent 70%);
  }

  .eyebrow {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(125, 211, 252, 0.14);
    color: #bae6fd;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hero h1,
  .page-shell h1,
  .page-shell h2,
  .page-shell h3,
  .page-shell h4,
  .page-shell p {
    margin: 0;
  }

  .hero h1 {
    margin-top: 12px;
    font-size: 32px;
    line-height: 1.15;
  }

  .hero p {
    margin-top: 10px;
    max-width: 760px;
    color: rgba(226, 232, 240, 0.88);
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
  }

  .hero-link,
  .action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 16px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    text-decoration: none;
    cursor: pointer;
    font-weight: 700;
  }

  .hero-link.primary,
  .action-button.primary {
    color: #eff6ff;
    background: linear-gradient(135deg, #2563eb, #0ea5e9);
    box-shadow: 0 18px 30px rgba(14, 165, 233, 0.22);
  }

  .hero-link.secondary,
  .action-button.secondary {
    color: var(--text-primary);
    background: var(--surface-card);
  }

  .stats-grid,
  .workspace-grid,
  .section-grid,
  .mini-grid {
    display: grid;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .workspace-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  .section-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .mini-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .stat-card,
  .workspace-card,
  .tile-card,
  .list-card,
  .report-card {
    background: var(--surface-card);
    border: 1px solid var(--border-soft);
    border-radius: 20px;
    box-shadow: 0 16px 32px var(--shadow-soft);
  }

  .stat-card,
  .workspace-card,
  .tile-card,
  .report-card {
    padding: 20px;
  }

  .stat-label,
  .meta-label {
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .stat-value {
    margin-top: 12px;
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .metric {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--border-soft);
  }

  .capability-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .chip,
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
  }

  .chip {
    background: rgba(219, 234, 254, 0.9);
    color: #1d4ed8;
  }

  .badge {
    background: var(--badge-bg);
    color: var(--text-secondary);
  }

  .badge.existing {
    background: rgba(220, 252, 231, 0.92);
    color: #15803d;
  }

  .badge.new {
    background: rgba(219, 234, 254, 0.92);
    color: #1d4ed8;
  }

  .badge.planned {
    background: rgba(254, 249, 195, 0.92);
    color: #a16207;
  }

  .list-card {
    overflow: hidden;
  }

  .list-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--border-soft);
  }

  .list {
    display: flex;
    flex-direction: column;
  }

  .list-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }

  .list-item:last-child {
    border-bottom: none;
  }

  .item-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .item-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .item-subtitle,
  .item-note {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .item-note {
    font-size: 13px;
  }

  .item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .coverage-table {
    width: 100%;
    border-collapse: collapse;
  }

  .coverage-table th,
  .coverage-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }

  .coverage-table th {
    color: #f8fafc;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .report-link {
    display: inline-flex;
    margin-top: 14px;
    color: var(--text-accent);
    font-weight: 700;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .page-shell {
      padding: 16px;
    }

    .hero {
      padding: 22px;
    }

    .hero h1 {
      font-size: 26px;
    }

    .list-item,
    .list-card-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
