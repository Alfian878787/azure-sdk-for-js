import * as assert from "assert";
import * as dotenv from "dotenv";
import { bodyToString, getBSU, getUniqueName } from "./utils";
dotenv.config({ path: "../.env" });

describe("ContainerClient", () => {
  const blobServiceClient = getBSU();
  let containerName: string = getUniqueName("container");
  let containerClient = blobServiceClient.createContainerClient(containerName);

  beforeEach(async () => {
    containerName = getUniqueName("container");
    containerClient = blobServiceClient.createContainerClient(containerName);
    await containerClient.create();
  });

  afterEach(async () => {
    await containerClient.delete();
  });

  it("setMetadata", async () => {
    const metadata = {
      key0: "val0",
      keya: "vala",
      keyb: "valb"
    };
    await containerClient.setMetadata(metadata);

    const result = await containerClient.getProperties();
    assert.deepEqual(result.metadata, metadata);
  });

  it("getProperties", async () => {
    const result = await containerClient.getProperties();
    assert.ok(result.eTag!.length > 0);
    assert.ok(result.lastModified);
    assert.ok(!result.leaseDuration);
    assert.equal(result.leaseState, "available");
    assert.equal(result.leaseStatus, "unlocked");
    assert.ok(result.requestId);
    assert.ok(result.version);
    assert.ok(result.date);
    assert.ok(!result.blobPublicAccess);
  });

  it("create with default parameters", (done) => {
    // create() with default parameters has been tested in beforeEach
    done();
  });

  it("create with all parameters configured", async () => {
    const cClient = blobServiceClient.createContainerClient(getUniqueName(containerName));
    const metadata = { key: "value" };
    const access = "container";
    await cClient.create({ metadata, access });
    const result = await cClient.getProperties();
    assert.deepEqual(result.blobPublicAccess, access);
    assert.deepEqual(result.metadata, metadata);
  });

  it("delete", (done) => {
    // delete() with default parameters has been tested in afterEach
    done();
  });

  it("listBlobsFlat with default parameters", async () => {
    const blobClients = [];
    for (let i = 0; i < 3; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`blockblob/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0);
      blobClients.push(blobClient);
    }

    const result = (await containerClient
      .listBlobsFlat()
      .byPage()
      .next()).value;
    assert.ok(result.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result.containerName));
    assert.deepStrictEqual(result.nextMarker, "");
    assert.deepStrictEqual(result.segment.blobItems!.length, blobClients.length);
    assert.ok(blobClients[0].url.indexOf(result.segment.blobItems![0].name));

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("listBlobsFlat with all parameters configured", async () => {
    const blobClients = [];
    const prefix = "blockblob";
    const metadata = {
      keya: "a",
      keyb: "c"
    };
    for (let i = 0; i < 2; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`${prefix}/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0, {
        metadata
      });
      blobClients.push(blobClient);
    }

    const result = (await containerClient
      .listBlobsFlat({
        include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
        prefix
      })
      .byPage({ maxPageSize: 1 })
      .next()).value;

    assert.ok(result.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result.containerName));
    assert.deepStrictEqual(result.segment.blobItems!.length, 1);
    assert.ok(blobClients[0].url.indexOf(result.segment.blobItems![0].name));
    assert.deepStrictEqual(result.segment.blobItems![0].metadata, metadata);

    const result2 = (await containerClient
      .listBlobsFlat({
        include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
        prefix
      })
      .byPage({ continuationToken: result.nextMarker, maxPageSize: 2 })
      .next()).value;

    assert.ok(result2.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result2.containerName));
    assert.deepStrictEqual(result2.segment.blobItems!.length, 1);
    assert.ok(blobClients[0].url.indexOf(result2.segment.blobItems![0].name));
    assert.deepStrictEqual(result2.segment.blobItems![0].metadata, metadata);

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("Verify PagedAsyncIterableIterator for listBlobsFlat", async () => {
    const blobClients = [];
    const prefix = "blockblob";
    const metadata = {
      keya: "a",
      keyb: "c"
    };
    for (let i = 0; i < 4; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`${prefix}/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0, {
        metadata
      });
      blobClients.push(blobClient);
    }

    let i = 0;
    for await (const blob of containerClient.listBlobsFlat({
      include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
      prefix
    })) {
      assert.ok(blobClients[i].url.indexOf(blob.name));
      assert.deepStrictEqual(blob.metadata, metadata);
      i++;
    }

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("Verify PagedAsyncIterableIterator(generator .next() syntax) for listBlobsFlat", async () => {
    const blobClients = [];
    const prefix = "blockblob";
    const metadata = {
      keya: "a",
      keyb: "c"
    };
    for (let i = 0; i < 2; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`${prefix}/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0, {
        metadata
      });
      blobClients.push(blobClient);
    }

    const iterator = await containerClient.listBlobsFlat({
      include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
      prefix
    });

    let blobItem = await iterator.next();
    assert.ok(blobClients[0].url.indexOf(blobItem.value.name));
    assert.deepStrictEqual(blobItem.value.metadata, metadata);

    blobItem = await iterator.next();
    assert.ok(blobClients[1].url.indexOf(blobItem.value.name));
    assert.deepStrictEqual(blobItem.value.metadata, metadata);

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("Verify PagedAsyncIterableIterator(byPage()) for listBlobsFlat", async () => {
    const blobClients = [];
    const prefix = "blockblob";
    const metadata = {
      keya: "a",
      keyb: "c"
    };
    for (let i = 0; i < 4; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`${prefix}/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0, {
        metadata
      });
      blobClients.push(blobClient);
    }

    let i = 0;
    for await (const response of containerClient
      .listBlobsFlat({
        include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
        prefix
      })
      .byPage({ maxPageSize: 2 })) {
      for (const blob of response.segment.blobItems) {
        assert.ok(blobClients[i].url.indexOf(blob.name));
        assert.deepStrictEqual(blob.metadata, metadata);
        i++;
      }
    }

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("Verify PagedAsyncIterableIterator(byPage() - continuationToken) for listBlobsFlat", async () => {
    const blobClients = [];
    const prefix = "blockblob";
    const metadata = {
      keya: "a",
      keyb: "c"
    };
    for (let i = 0; i < 4; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`${prefix}/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0, {
        metadata
      });
      blobClients.push(blobClient);
    }

    let i = 0;
    let iter = containerClient
      .listBlobsFlat({
        include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
        prefix
      })
      .byPage({ maxPageSize: 2 });
    let response = (await iter.next()).value;
    for (const blob of response.segment.blobItems) {
      assert.ok(blobClients[i].url.indexOf(blob.name));
      assert.deepStrictEqual(blob.metadata, metadata);
      i++;
    }
    // Gets next marker
    let marker = response.nextMarker;
    // Passing next marker as continuationToken
    iter = containerClient
      .listBlobsFlat({
        include: ["snapshots", "metadata", "uncommittedblobs", "copy", "deleted"],
        prefix
      })
      .byPage({ continuationToken: marker, maxPageSize: 2 });
    response = (await iter.next()).value;
    // Gets 2 blobs
    for (const blob of response.segment.blobItems) {
      assert.ok(blobClients[i].url.indexOf(blob.name));
      assert.deepStrictEqual(blob.metadata, metadata);
      i++;
    }

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("listBlobHierarchySegment with default parameters", async () => {
    const blobClients = [];
    for (let i = 0; i < 3; i++) {
      const blobClient = containerClient.createBlobClient(getUniqueName(`blockblob${i}/${i}`));
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0);
      blobClients.push(blobClient);
    }

    const delimiter = "/";
    const result = await containerClient.listBlobHierarchySegment(delimiter);
    assert.ok(result.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result.containerName));
    assert.deepStrictEqual(result.nextMarker, "");
    assert.deepStrictEqual(result.delimiter, delimiter);
    assert.deepStrictEqual(result.segment.blobPrefixes!.length, blobClients.length);

    for (const blob of blobClients) {
      let i = 0;
      assert.ok(blob.url.indexOf(result.segment.blobPrefixes![i++].name));
    }

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("listBlobHierarchySegment with all parameters configured", async () => {
    const blobClients = [];
    const prefix = "blockblob";
    const metadata = {
      keya: "a",
      keyb: "c"
    };
    const delimiter = "/";
    for (let i = 0; i < 2; i++) {
      const blobClient = containerClient.createBlobClient(
        getUniqueName(`${prefix}${i}${delimiter}${i}`)
      );
      const blockBlobClient = blobClient.createBlockBlobClient();
      await blockBlobClient.upload("", 0, {
        metadata
      });
      blobClients.push(blobClient);
    }

    const result = await containerClient.listBlobHierarchySegment(delimiter, undefined, {
      include: ["metadata", "uncommittedblobs", "copy", "deleted"],
      maxresults: 1,
      prefix
    });
    assert.ok(result.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result.containerName));
    assert.deepStrictEqual(result.segment.blobPrefixes!.length, 1);
    assert.deepStrictEqual(result.segment.blobItems!.length, 0);
    assert.ok(blobClients[0].url.indexOf(result.segment.blobPrefixes![0].name));

    const result2 = await containerClient.listBlobHierarchySegment(delimiter, result.nextMarker, {
      include: ["metadata", "uncommittedblobs", "copy", "deleted"],
      maxresults: 2,
      prefix
    });
    assert.ok(result2.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result2.containerName));
    assert.deepStrictEqual(result2.segment.blobPrefixes!.length, 1);
    assert.deepStrictEqual(result2.segment.blobItems!.length, 0);
    assert.ok(blobClients[0].url.indexOf(result2.segment.blobPrefixes![0].name));

    const result3 = await containerClient.listBlobHierarchySegment(delimiter, undefined, {
      include: ["metadata", "uncommittedblobs", "copy", "deleted"],
      maxresults: 2,
      prefix: `${prefix}0${delimiter}`
    });
    assert.ok(result3.serviceEndpoint.length > 0);
    assert.ok(containerClient.url.indexOf(result3.containerName));
    assert.deepStrictEqual(result3.nextMarker, "");
    assert.deepStrictEqual(result3.delimiter, delimiter);
    assert.deepStrictEqual(result3.segment.blobItems!.length, 1);
    assert.deepStrictEqual(result3.segment.blobItems![0].metadata, metadata);
    assert.ok(blobClients[0].url.indexOf(result3.segment.blobItems![0].name));

    for (const blob of blobClients) {
      await blob.delete();
    }
  });

  it("uploadBlockBlob and deleteBlob", async () => {
    const body: string = getUniqueName("randomstring");
    const options = {
      blobCacheControl: "blobCacheControl",
      blobContentDisposition: "blobContentDisposition",
      blobContentEncoding: "blobContentEncoding",
      blobContentLanguage: "blobContentLanguage",
      blobContentType: "blobContentType",
      metadata: {
        keya: "vala",
        keyb: "valb"
      }
    };
    const blobName: string = getUniqueName("blob");
    const { blockBlobClient } = await containerClient.uploadBlockBlob(blobName, body, body.length, {
      blobHTTPHeaders: options,
      metadata: options.metadata
    });
    const result = await blockBlobClient.download(0);
    assert.deepStrictEqual(await bodyToString(result, body.length), body);
    assert.deepStrictEqual(result.cacheControl, options.blobCacheControl);

    await containerClient.deleteBlob(blobName);
    try {
      await blockBlobClient.getProperties();
      assert.fail(
        "Expecting an error in getting properties from a deleted block blob but didn't get one."
      );
    } catch (error) {
      assert.ok((error.statusCode as number) === 404);
    }
  });
});