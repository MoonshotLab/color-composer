// // var synth = new Tone.AMSynth().toMaster();
// // synth.triggerAttackRelease("C4", "2n");
// //
// // var duoSynth = new Tone.DuoSynth().toMaster();
// // duoSynth.triggerAttackRelease("C4", "2n");
// //
// // var plucky = new Tone.PluckSynth().toMaster();
// // plucky.triggerAttack("C4");
// //
// // var synth = new Tone.MembraneSynth().toMaster();
// // synth.triggerAttackRelease("C2", "2n");
// //
// // var synth = new Tone.MonoSynth().toMaster();
// // synth.triggerAttackRelease("C4", "2n");
// //
// // var noiseSynth = new Tone.NoiseSynth().toMaster();
// // noiseSynth.triggerAttackRelease("8n");
// //
// // var synth = new Tone.PolySynth(6, Tone.Synth).toMaster();
// // synth.triggerAttackRelease(["C4"], "4n");
// //
// // var sampler = new Sampler("./audio/casio/A1.mp3", function(){
// // 	//repitch the sample down a half step
// // 	sampler.triggerAttack(-1);
// // }).toMaster();
// //
// // var synth = new Tone.Synth().toMaster();
// // synth.triggerAttackRelease("C4", "8n");
//
// // var synth = new Tone.Synth();
// // synth.toMaster();
// //
// // var pattern = new Tone.Pattern(function(time, note){
// //     synth.triggerAttackRelease(note, 0.5);
// // }, ["C4", "E4", "G4", "A4"]);
// // pattern.start(0);
// //
// // Tone.Transport.start();
//
// var osc = new Tone.OmniOscillator();
// osc.frequency.value = "C4";
// osc.start().stop("+8n");
//
// var env = new Tone.AmplitudeEnvelope();
// osc.connect(env);
// env.toMaster();
//
// osc.start();
// env.triggerAttack();
//
// var osc2 = new Tone.OmniOscillator();
// osc2.frequency.value = "E4";
// osc2.start().stop("+8n");
//
// var env2 = new Tone.AmplitudeEnvelope();
// osc2.connect(env2);
// env2.toMaster();
//
// osc2.start();
// env2.triggerAttack();
//
// var osc3 = new Tone.OmniOscillator();
// osc3.frequency.value = "G4";
// osc3.start().stop("+8n");
//
// var env3 = new Tone.AmplitudeEnvelope();
// osc3.connect(env3);
// env3.toMaster();
//
// osc3.start();
// env3.triggerAttack();
//
// var osc4 = new Tone.OmniOscillator();
// osc4.frequency.value = "C2";
// osc4.start().stop("+8n");
//
// var env4 = new Tone.AmplitudeEnvelope();
// osc4.connect(env4);
// env4.toMaster();
//
// osc4.start();
// env4.triggerAttack();
