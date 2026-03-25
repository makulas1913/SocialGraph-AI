// In-memory mock for Prisma to remove database dependency
const inMemoryDb: any = {
  persona: [],
  history: []
};

const prisma: any = {
  persona: {
    findFirst: async ({ where }: any) => {
      // If userId is null/undefined, just return the first one
      if (where && (where.userId === null || where.userId === undefined)) {
        return inMemoryDb.persona[0] || null;
      }
      return inMemoryDb.persona.find((p: any) => p.userId === where.userId) || null;
    },
    create: async ({ data }: any) => {
      const newPersona = { 
        id: Math.random().toString(36).substr(2, 9), 
        userId: data.userId || null,
        ...data 
      };
      inMemoryDb.persona.push(newPersona);
      return newPersona;
    },
    update: async ({ where, data }: any) => {
      const index = inMemoryDb.persona.findIndex((p: any) => p.id === where.id);
      if (index !== -1) {
        inMemoryDb.persona[index] = { ...inMemoryDb.persona[index], ...data };
        return inMemoryDb.persona[index];
      }
      return null;
    }
  },
  history: {
    findMany: async ({ where, orderBy, take }: any) => {
      let results = [...inMemoryDb.history];
      if (where && where.userId !== undefined) {
        results = results.filter(h => h.userId === where.userId || (where.userId === null && !h.userId));
      }
      if (orderBy && orderBy.createdAt === 'desc') {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      if (take) {
        results = results.slice(0, take);
      }
      return results;
    },
    create: async ({ data }: any) => {
      const newHistory = { 
        id: Math.random().toString(36).substr(2, 9), 
        createdAt: new Date(),
        ...data 
      };
      inMemoryDb.history.push(newHistory);
      return newHistory;
    },
    delete: async ({ where }: any) => {
      const index = inMemoryDb.history.findIndex((h: any) => h.id === where.id);
      if (index !== -1) {
        inMemoryDb.history.splice(index, 1);
      }
      return { id: where.id };
    }
  }
};

export default prisma;
