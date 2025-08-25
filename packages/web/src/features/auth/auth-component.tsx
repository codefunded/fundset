const AuthComponent = async ({ settlementLayerName }: { settlementLayerName: string }) => {
  const { default: AuthComponent } = await import(`./${settlementLayerName}`);
  return <AuthComponent />;
};

export default AuthComponent;
