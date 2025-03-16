describe('API Speed Test', () => {
  it('should fetch users quickly', () => {
    const startTime = performance.now();
    
    cy.request('GET', 'http://172.21.80.1:7070/api/User/1').then((response) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      cy.log(`Response time: ${duration.toFixed(2)} ms`);
      
      expect(duration).to.be.lessThan(500);
    });
  });
});
