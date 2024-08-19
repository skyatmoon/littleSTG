document.getElementById('play-melody').addEventListener('click', async function() {
    await Tone.start(); // Ensure Tone.js is started (required for some browsers)

    const synth = new Tone.Synth().toDestination();

    const melody = [
        { note: 'E4', duration: '4n' }, // Jingle
        { note: 'E4', duration: '4n' }, // Bells
        { note: 'E4', duration: '2n' }, // Jingle all
        { note: 'E4', duration: '4n' }, // The way
        { note: 'E4', duration: '4n' }, // Oh what
        { note: 'E4', duration: '4n' }, // Fun it
        { note: 'G4', duration: '4n' }, // Is to ride
        { note: 'C4', duration: '4n' }, // In a one
        { note: 'D4', duration: '4n' }, // Horse open
        { note: 'E4', duration: '4n' }, // Sleigh
        { note: 'F4', duration: '4n' }, // Hey
        { note: 'F4', duration: '4n' }, // Jingle
        { note: 'F4', duration: '4n' }, // Bells
        { note: 'F4', duration: '4n' }, // Jingle
        { note: 'F4', duration: '4n' }, // All
        { note: 'E4', duration: '4n' }, // The
        { note: 'E4', duration: '4n' }, // Way
        { note: 'D4', duration: '4n' }, // Oh what
        { note: 'D4', duration: '4n' }, // Fun it
        { note: 'E4', duration: '2n' }  // Is to ride
    ];

    let time = Tone.now();
    melody.forEach((note) => {
        synth.triggerAttackRelease(note.note, note.duration, time);
        time += Tone.Time(note.duration).toSeconds();
    });
});