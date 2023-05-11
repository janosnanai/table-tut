import { factory, oneOf, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";

const db = factory({
  user: {
    id: primaryKey(faker.datatype.uuid),
    username: faker.internet.userName,
    email: faker.internet.email,
    fullName: faker.name.fullName,
    org: oneOf("org"),
    group: oneOf("group"),
    active: Boolean,
    remark: faker.lorem.sentence,
  },
  org: {
    id: primaryKey(faker.datatype.uuid),
    name: faker.company.name,
  },
  group: {
    id: primaryKey(faker.datatype.uuid),
    name: faker.commerce.department,
  },
});

for (let i = 0; i < 10; i++) {
  db.org.create();
}

for (let i = 0; i < 10; i++) {
  db.group.create();
}

const orgs = db.org.getAll();
const groups = db.group.getAll();

for (let i = 0; i < 200; i++) {
  const org = faker.helpers.arrayElement(orgs);
  const group = faker.helpers.arrayElement(groups);
  const active = Math.random() < 0.1 ? false : true;
  db.user.create({ org, group, active });
}

export default db;

export type Org = { id: string; name: string };

export type Group = { id: string; name: string };

export type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  org: Org;
  group: Group;
  active: boolean;
  remark: string;
};
