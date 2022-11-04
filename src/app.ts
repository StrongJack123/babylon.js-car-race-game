import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { ActionManager, ExecuteCodeAction, Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, DirectionalLight, StandardMaterial, Color3, Texture, Vector4, Axis, Space, SolidParticleSystem } from "@babylonjs/core";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }


class App {

     // General Entire Application
     private _scene: Scene;
     private _canvas: HTMLCanvasElement;
     private _engine: Engine;

     
    //Scene - related
    private _state: number = 0;
    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }
    
    constructor() {

        this._canvas = this._createCanvas();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // set camera
        var camera = new ArcRotateCamera("camera1",  0, 0, 20, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(11.5, 3.5, 0));	

        /*      var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
                camera.attachControl(this._canvas, true);
                var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
                var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
        */

        // lights
        var light1 = new DirectionalLight("light1", new Vector3(1, 2, 0), this._scene);
        var light2 = new HemisphericLight("light2", new Vector3(0, 1, 0), this._scene);
        light2.intensity = 0.75;
       

        /***************************Car*********************************************/

        /*-----------------------Car Body------------------------------------------*/ 
        
            //Car Body Material 
            var bodyMaterial = new  StandardMaterial("body_mat", this._scene);
            bodyMaterial.diffuseColor = new  Color3(1.0, 0.3, 0.8);
            bodyMaterial.backFaceCulling = false;

            //Array of points for trapezium side of car.
            var side = [new  Vector3(-6.5, 1.5, -2),
                new  Vector3(2.5, 1.5, -2),
                new  Vector3(3.5, 0.5, -2),
                new  Vector3(-9.5, 0.5, -2)				
            ];

            side.push(side[0]);	//close trapezium
        
        //Array of points for the extrusion path
        var extrudePath = [new  Vector3(0, 0, 0), new  Vector3(0, 0, 4)];
        
        //Create body and apply material
        var carBody =  MeshBuilder.ExtrudeShape("body", {shape: side, path: extrudePath, cap :  Mesh.CAP_ALL}, this._scene);
        carBody.material = bodyMaterial;
        camera.parent = carBody;
        /*-----------------------End Car Body------------------------------------------*/


        //Wheel Material 
        var wheelMaterial = new  StandardMaterial("wheel_mat", this._scene);
        var wheelTexture = new  Texture("http://i.imgur.com/ZUWbT6L.png", this._scene);
        wheelMaterial.diffuseTexture = wheelTexture;
        
        //Set color for wheel tread as black
        var faceColors=[];
        faceColors[1] = new  Color3(0,0,0);
        
        //set texture for flat face of wheel 
        var faceUV =[];
        faceUV[0] = new  Vector4(0,0,1,1);
        faceUV[2] = new  Vector4(0,0,1,1);
        
        //create wheel front inside and apply material
        var wheelFI =  MeshBuilder.CreateCylinder("wheelFI", {diameter: 3, height: 1, tessellation: 24, faceColors:faceColors, faceUV:faceUV}, this._scene);
            wheelFI.material = wheelMaterial;
            
        //rotate wheel so tread in xz plane  
            wheelFI.rotate( Axis.X, Math.PI/2,  Space.WORLD); 	
        /*-----------------------End Wheel------------------------------------------*/ 


        /*-------------------Pivots for Front Wheels-----------------------------------*/
        var pivotFI = new  Mesh("pivotFI", this._scene);
        pivotFI.parent = carBody;
        pivotFI.position = new  Vector3(-6.5, 0, -2);
        
        var pivotFO = new  Mesh("pivotFO", this._scene);
        pivotFO.parent = carBody;
        pivotFO.position = new  Vector3(-6.5, 0, 2);  
        /*----------------End Pivots for Front Wheels--------------------------------*/

        /*------------Create other Wheels as Instances, Parent and Position----------*/
        var wheelFO = wheelFI.createInstance("FO");
        wheelFO.parent = pivotFO;
        wheelFO.position = new  Vector3(0, 0, 1.8);
        
        var wheelRI = wheelFI.createInstance("RI");
        wheelRI.parent = carBody;
        wheelRI.position = new  Vector3(0, 0, -2.8);
        
        var wheelRO = wheelFI.createInstance("RO");
        wheelRO.parent = carBody;
        wheelRO.position = new  Vector3(0, 0, 2.8);
        
        wheelFI.parent = pivotFI;
        wheelFI.position = new  Vector3(0, 0, -1.8);
        /*------------End Create other Wheels as Instances, Parent and Position----------*/
            

        /*---------------------Create Car Centre of Rotation-----------------------------*/
            var pivot = new Mesh("pivot", this._scene); //current centre of rotation
            pivot.position.z = 50;
            carBody.parent = pivot;
            carBody.position = new  Vector3(0, 0, -50);
            
        /*---------------------End Create Car Centre of Rotation-------------------------*/


        

          /*************************** End Car*********************************************/
  
            /*****************************Add Ground********************************************/
            var groundSize = 400;
            
            var ground =  MeshBuilder.CreateGround("ground", {width: groundSize, height: groundSize}, this._scene);
            var groundMaterial = new  StandardMaterial("ground", this._scene);
            groundMaterial.diffuseColor = new  Color3(0.75, 1, 0.25);
            ground.material = groundMaterial;
            ground.position.y = -1.5;
            /*****************************End Add Ground********************************************/ 
            

            /*****************************Particles to Show Movement********************************************/ 
  var box =  MeshBuilder.CreateBox("box", {}, this._scene);
  box.position = new  Vector3(20, 0, 10);
  

 var boxesSPS = new  SolidParticleSystem("boxes", this._scene, {updatable: false});
    
    //function to position of grey boxes
    var set_boxes = function(particle, i, s) {
        particle.position = new  Vector3(-200 + Math.random()*400, 0, -200 + Math.random()*400); 
    }
    
    //add 400 boxes
    boxesSPS.addShape(box, 400, {positionFunction:set_boxes});  
    var boxes = boxesSPS.buildMesh(); // mesh of boxes
	boxes.material = new  StandardMaterial("", this._scene);
	boxes.material.alpha = 0.25;
 /*****************************Particles to Show Movement********************************************/

    /****************************Key Controls************************************************/
    
    var map ={}; //object for multiple key presses
    this._scene.actionManager = new  ActionManager(this._scene);
    
    this._scene.actionManager.registerAction(new  ExecuteCodeAction( ActionManager.OnKeyDownTrigger, function (evt) {								
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        
        }));
        
    this._scene.actionManager.registerAction(new  ExecuteCodeAction( ActionManager.OnKeyUpTrigger, function (evt) {								
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));	
        
    /****************************End Key Controls************************************************/


        /****************************Variables************************************************/
        
        var theta = 0;
        var deltaTheta = 0;
        var D = 0; //distance translated per second
        var R = 50; //turning radius, initial set at pivot z value
        var NR; //Next turning radius on wheel turn
        var A = 4; // axel length
        var L = 4; //distance between wheel pivots
        var r = 1.5; // wheel radius
        var psi, psiRI, psiRO, psFI, psiFO; //wheel rotations  
        var phi; //rotation of car when turning 
        
        var F; // frames per second	
        
        /****************************End Variables************************************************/
        
        /****************************** Animation ****************************************/
        this._scene.registerAfterRender(() => {
           
            F = this._engine.getFps();

            
            if(map[" "] && D < 15 ) {
                D += 1;		
                console.log("HERE" + F);
            };
            if(D > 0.15) {
                D -= 0.15;
            } 
            else {
                D = 0;
            }

            let distance = D/F;
            psi = D/(r * F);

            if((map["a"] || map["A"]) && -Math.PI/6 < theta){
                deltaTheta = -Math.PI/252;
                theta += deltaTheta;
                pivotFI.rotate( Axis.Y, deltaTheta,  Space.LOCAL);
                pivotFO.rotate( Axis.Y, deltaTheta,  Space.LOCAL);
                if(Math.abs(theta) > 0.00000001) {
                    NR = A/2 +L/Math.tan(theta);	
                }
                else {
                    theta = 0;
                    NR = 0;
                }

                pivot.translate( Axis.Z, NR - R,  Space.LOCAL);
                carBody.translate( Axis.Z, R - NR,  Space.LOCAL);
			    R = NR;
            }

            if((map["d"] || map["D"])  && theta < Math.PI/6) {
                deltaTheta = Math.PI/252;
                theta += deltaTheta;
                pivotFI.rotate( Axis.Y, deltaTheta,  Space.LOCAL);
                pivotFO.rotate( Axis.Y, deltaTheta,  Space.LOCAL);
                if(Math.abs(theta) > 0.00000001) {
                    NR = A/2 +L/Math.tan(theta);	
                }
                else {
                    theta = 0;
                    NR = 0;
                }
                pivot.translate( Axis.Z, NR - R,  Space.LOCAL);
                carBody.translate( Axis.Z, R - NR,  Space.LOCAL);
                R = NR;
                        
            };
            if(D > 0) {
                phi = D/(R * F);
                if(Math.abs(theta)>0) {	 
                    pivot.rotate( Axis.Y, phi,  Space.WORLD);
                    psiRI = D/(r * F);
                    psiRO = D * (R + A)/(r * F);
                    let psiFI = D * Math.sqrt(R* R + L * L)/(r * F);
                    psiFO = D * Math.sqrt((R + A) * (R + A) + L * L)/(r * F);
                
                    wheelFI.rotate( Axis.Y, psiFI,  Space.LOCAL); 
                     wheelFO.rotate( Axis.Y, psiFO,  Space.LOCAL);
                     wheelRI.rotate( Axis.Y, psiRI,  Space.LOCAL);
                     wheelRO.rotate( Axis.Y, psiRO,  Space.LOCAL);
                 }
                 else {
                     pivot.translate( Axis.X, -distance,  Space.LOCAL);
                    wheelFI.rotate( Axis.Y, psi,  Space.LOCAL); 
                     wheelFO.rotate( Axis.Y, psi,  Space.LOCAL);
                     wheelRI.rotate( Axis.Y, psi,  Space.LOCAL);
                     wheelRO.rotate( Axis.Y, psi,  Space.LOCAL);
                 }
            }
        });


            // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }
}
new App();