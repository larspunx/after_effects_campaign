// Sanity check — sprawdza czy bridge działa.
// Nie modyfikuje projektu. Pisze rezultat do JS console (w AE: Window > Info, lub log AE).
(function ping() {
    var msg = "PING OK | project=" + (app.project.file ? app.project.file.name : "<bez nazwy>") +
              " | numItems=" + app.project.numItems;
    $.writeln(msg);
    alert(msg); // pominięte w trybie cichym
})();
