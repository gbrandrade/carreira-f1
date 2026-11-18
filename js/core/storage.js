/* Salvamento: localStorage + exportar/importar arquivo JSON. */
(function () {
  const key = () => Game.config.saveKey;
  Game.core.storage = {
    save(state) { try { localStorage.setItem(key(), JSON.stringify(state)); return true; } catch (e) { return false; } },
    load() { try { const s = localStorage.getItem(key()); const st = s ? JSON.parse(s) : null; if (st && Game.systems && Game.systems.owner) Game.systems.owner.syncCustomTeam(st); return st; } catch (e) { return null; } },
    has() { try { return !!localStorage.getItem(key()); } catch (e) { return false; } },
    clear() { try { localStorage.removeItem(key()); } catch (e) {} },
    exportFile(state) {
      const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'caminho-ate-a-f1-save.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    importFile(file) {
      return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => { try { const s = JSON.parse(r.result); if (s && s.player) { if (Game.systems && Game.systems.owner) Game.systems.owner.syncCustomTeam(s); res(s); } else rej(new Error('Arquivo inválido')); } catch (e) { rej(e); } };
        r.onerror = () => rej(new Error('Falha ao ler'));
        r.readAsText(file);
      });
    }
  };
})();
