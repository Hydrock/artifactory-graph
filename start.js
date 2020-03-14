const fetch = require('node-fetch');
var babar = require('babar');


const credentialHeaders = {
    'X-JFrog-Art-Api': ''
}

const folderUri = 'http://binary/artifactory/api/storage/alfaoffice-docker-releases/ona-ao-ui';

async function getFolderInfo(folderUri) {
    const response = await fetch(folderUri, {
        headers: credentialHeaders
    });

    const result = await response.json();

    return result;
}

const imagesInfo = [];

async function getGraph() {
    const folderInfo = await getFolderInfo(folderUri);
    // имена всех контейнеров
    const mainFolderChildrens = folderInfo.children;

    await mainFolderChildrens.forEach(async function (element, id) {
        imagesInfo.push({
            name: element.uri,
            size: 0
        });

        const dockerFolderUri = `${folderUri}${element.uri}`;
        const dockerFolderInfo = await getFolderInfo(dockerFolderUri);
        let dockerFolderChildrens = dockerFolderInfo.children;

        // /1.729.1-1 
        await dockerFolderChildrens.forEach(async function (element) {
            try {
                const dockerFolderLayerUri = `${dockerFolderUri}${element.uri}`;
                const dockerFolderLayerInfo = await getFolderInfo(dockerFolderLayerUri);
                // imagesInfo[id].size.push(dockerFolderLayerInfo.size / 1024 / 1024);
                imagesInfo[id].size += (dockerFolderLayerInfo.size / 1024 / 1024);
            } catch (e) {
                console.log(e);
            }
        });
    });
}


async function run() {
    await getGraph();
    setTimeout(() => {

        const chartArr = [[0, 0]];
        
        imagesInfo.forEach((el, i) => {
            el.size = parseFloat(el.size.toFixed(2));

            chartArr.push([i +1, el.size]);
        })

        console.log(chartArr);
        console.log(babar(chartArr, {
            height: 100,
            minY: 0,
            maxY: 250
        }));


        // console.log(imagesInfo);

        
        
    }, 3000)
}

run()


