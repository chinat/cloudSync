#include "lib/utils.h"
#include "lib/github.h"

#include <QCoreApplication>


int main(int argc, char **argv) {
    QCoreApplication app(argc, argv);
    
    using namespace GitHub;
    
    Authorization auth;
    auth.create();
    
    
    
    
    return app.exec();
}

