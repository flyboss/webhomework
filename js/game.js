var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
};

var container, stats;
var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var clock = new THREE.Clock();
var controls, box, plane, planeBox, propeller;
var cameraCube, building;
var collideMeshList = [], flag = [];
var movingCube1;
var message = document.getElementById("message");
var score = 0;
var crashBuilding = 0;
message.innerText = score;
init();
animate();


function init() {

    container = document.getElementById("myspace")
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 40000);
    camera.position.set(-50000, 10000, 9000);

    scene = new THREE.Scene();


    createLights();
    createPropeller();


    var cubeGeometry = new THREE.CubeGeometry(250, 250, 250, 10, 10, 10);
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff000,
        wireframe: true
    });
    cameraCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    //scene.add(cameraCube);

    createBox();
    createBuilding();



    // var planeGeometry = new THREE.PlaneGeometry(60, 20);
    // var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.receiveShadow = true;
    // // rotate and position the plane
    // plane.position.x = 0;
    // plane.position.y = 0;
    // plane.position.z = 1000;
    // // add the plane to the scene
    // scene.add(plane);


    createControls();

    createMtlObj({
        mtlBaseUrl: "/resource/",
        mtlPath: "/resource/",
        mtlFileName: "test.mtl",
        objPath: "/resource/",
        objFileName: "test.obj",
        completeCallback: function (object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.side = THREE.DoubleSide;
                    child.receiveShadow = true;
                    child.material.transparent = true;
                    //child.material.opacity=0;
                    //child.material.shading=THREE.SmoothShading;
                    // var box = new THREE.BoxHelper( child );
                    // box.material.color.setHex( 0x888888);
                    // scene.add(box);


                }
            });
            object.receiveShadow = true;
            object.castShadow = true;

            // object.emissive = 0x00ffff;
            // object.ambient = 0x00ffff;
            //object.rotation.x= 10/180*Math.PI;
            // object.position.y = 1;
            // object.position.x = 1;
            // object.position.z = 1;
            // object.scale.x = 1;
            // object.scale.y = 1;
            // object.scale.z = 1;
            object.name = "building";
            // object.rotation.y = -Math.PI;
            scene.add(object);

        },
        progress: function (persent) {

            $("#havenloading .progress").css("width", persent + "%");
        }
    });

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xE0FFFF);
    //renderer.shadowMapEnabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}
function updateCollide() {
    var originPoint = cameraCube.position.clone();
    var crash;
    for (var vertexIndex = 0; vertexIndex < cameraCube.geometry.vertices.length; vertexIndex++) {
        // 顶点原始坐标
        var localVertex = cameraCube.geometry.vertices[vertexIndex].clone();
        // 顶点经过变换后的坐标
        var globalVertex = localVertex.applyMatrix4(cameraCube.matrix);
        var directionVector = globalVertex.sub(cameraCube.position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        for (var i = 0; i < collideMeshList.length; i++) {
            if (flag[i] == 0)
                continue;
            var collisionResults = ray.intersectObject(collideMeshList[i], true);

            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                score += 1;
                message.innerText = score;
                // console.log("Crash");
                //scene.remove(collideMeshList[i]);
                // collideMeshLis
                var name = "box" + i;
                scene.remove(scene.getObjectByName(name));
                flag[i] = 0;
                break;
            }
        }
        if (crashBuilding == 0) {
            var buildingResults = ray.intersectObject(building);
            if (buildingResults.length > 0 && buildingResults[0].distance < directionVector.length()) {
                scene.remove(building);
                message.innerText = "";
                document.getElementById("resetdiv").innerText="crash";
                crashBuilding = 1;
            }
        }
    }
}


function createBox() {
    var cubeGeometry = new THREE.CubeGeometry(500, 500, 500, 10, 10, 10);
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff000,
    });
    var box = new THREE.Mesh(cubeGeometry, wireMaterial);
    box.position.set(-15256, 6730, 4545);
    box.name = "box0";
    collideMeshList.push(box);
    flag.push(1);
    scene.add(box);
    var wireMaterial1 = new THREE.MeshBasicMaterial({
        color:0xFF0033,
    });
    var box = new THREE.Mesh(cubeGeometry, wireMaterial1);
    box.position.set(22118, 8100, -2116);
    box.name = "box1";
    collideMeshList.push(box);
    flag.push(1);
    scene.add(box);
}


function createBuilding() {
    var cubeGeometry = new THREE.CubeGeometry(2600, 7900, 1900, 10, 10, 10);
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x6495ED,
        wireframe:true
    });
    building = new THREE.Mesh(cubeGeometry, wireMaterial);
    building.position.set(4900, 2900, -19100);
    building.name = "building";
    scene.add(building);
}

function updateCameraCube() {
    cameraCube.position.x = camera.position.x;
    cameraCube.position.y = camera.position.y;
    cameraCube.position.z = camera.position.z;
}

function render() {
    if (crashBuilding == 0) {
    controls.update(clock.getDelta());
    updateCollide();
    updatePropeller();
    updateCameraCube();
    renderer.render(scene, camera);
    }
}


function createMtlObj(options) {
    THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
    var mtlLoader = new THREE.MTLLoader();
    //mtlLoader.setBaseUrl( options.mtlBaseUrl );
    mtlLoader.setPath(options.mtlPath);
    mtlLoader.load(options.mtlFileName, function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(options.objPath);
        objLoader.load(options.objFileName, function (object) {
            if (typeof options.completeCallback == "function") {
                options.completeCallback(object);
            }
        }, function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                if (typeof options.progress == "function") {
                    options.progress(Math.round(percentComplete, 2));
                }
                //console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        }, function (error) {

        });

    });
}
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX ) / 2;
    mouseY = ( event.clientY - windowHalfY ) / 2;
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function createControls() {
    controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 5750;
    controls.lookSpeed = 0.05;
    controls.lookVertical = true;
}
function createLights() {
    var ambient = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0x999999);
    directionalLight.position.set(-50000, 50000, 10000).normalize();
    scene.add(directionalLight);


    // var ambientLight = new THREE.AmbientLight( 0xbbbbbb );
    // scene.add( ambientLight );
    //
    // var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    // directionalLight.position.set( 1, 1, 0.5 ).normalize();
    // scene.add( directionalLight );

    // var pointlight = new THREE.PointLight(0x63d5ff, 1, 200);
    // pointlight.position.set(0, 0, 200);
    // scene.add( pointlight );
    // var pointlight2 = new THREE.PointLight(0xffffff, 1, 200);
    // pointlight2.position.set(-200, 200, 200);
    // scene.add( pointlight2 );
    // var pointlight3 = new THREE.PointLight(0xffffff, 1.5, 200);
    // pointlight3.position.set(-200, 200, 0);
    // scene.add( pointlight3 );
    // scene.add( new THREE.PointLightHelper( pointlight3 ) );
    // scene.add( new THREE.PointLightHelper( pointlight2 ) );
    // scene.add( new THREE.PointLightHelper( pointlight ) );

}
function createPropeller() {

    propeller = new THREE.Mesh();

    var geomBlade = new THREE.BoxGeometry(800, 10, 10, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({color: Colors.brownDark, shading: THREE.FlatShading});
    var blade1 = new THREE.Mesh(geomBlade, matBlade);
    //blade1.position.set(0,0,10);


    var blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;

    propeller.add(blade1);
    propeller.add(blade2);
    propeller.position.set(-45000, 5075, 10000);
    scene.add(propeller);
}
function updatePropeller() {
    propeller.rotation.y += 0.02;
    propeller.position.x = camera.position.x;
    propeller.position.y = camera.position.y + 75;
    propeller.position.z = camera.position.z;

}
function reset() {
    if(crashBuilding==1){
        location.reload();
    }
}
